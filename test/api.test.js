import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../app';
import Hotel from '../api/data/hotels.model';
import hotelData from '../api/data/hotel-data.json';

const config = { jwtSecret: 'test-secret', jwtExpiresIn: '1h' };

// CI must run these; locally they are skipped if MongoDB can't be downloaded.
let mongo;
try {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongo = await MongoMemoryServer.create();
} catch (err) {
  if (process.env.CI) throw err;
  console.warn(`Skipping API tests: ${err.message}`);
}

describe.skipIf(!mongo)('MEAN hotel API', () => {
  let app;

  beforeAll(async () => {
    await mongoose.connect(mongo.getUri());
    await Hotel.syncIndexes();
    app = createApp(config);
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
    await Hotel.insertMany(hotelData);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo?.stop();
  });

  async function login(username = 'alice') {
    await request(app).post('/api/users/register').send({ username, password: 'password123' });
    const res = await request(app).post('/api/users/login').send({ username, password: 'password123' });
    return `Bearer ${res.body.token}`;
  }

  describe('hotels', () => {
    it('lists 5 by default and supports paging', async () => {
      const first = await request(app).get('/api/hotels');
      expect(first.status).toBe(200);
      expect(first.body).toHaveLength(5);
      expect(first.body[0].reviews).toBeUndefined();

      const page = await request(app).get('/api/hotels?offset=10&count=5');
      expect(page.body).toHaveLength(2);
    });

    it('validates paging parameters', async () => {
      expect((await request(app).get('/api/hotels?count=50')).status).toBe(400);
      expect((await request(app).get('/api/hotels?offset=abc')).status).toBe(400);
    });

    it('finds hotels near a point', async () => {
      const res = await request(app).get('/api/hotels?lat=47.5&lng=19.06');
      expect(res.status).toBe(200);
      expect(res.body.map((h) => h.name)).toContain('Corinthia Hotel Budapest');
      expect(res.body.every((h) => h.location.address.includes('Budapest'))).toBe(true);
    });

    it('returns one hotel, or 404', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      expect((await request(app).get(`/api/hotels/${hotel._id}`)).body.name).toBe(hotel.name);
      expect((await request(app).get('/api/hotels/000000000000000000000000')).status).toBe(404);
      expect((await request(app).get('/api/hotels/not-an-id')).status).toBe(404);
    });

    it('requires login to create, update or delete', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      expect((await request(app).post('/api/hotels').send({ name: 'X' })).status).toBe(401);
      expect((await request(app).put(`/api/hotels/${hotel._id}`).send({ name: 'X' })).status).toBe(401);
      expect((await request(app).delete(`/api/hotels/${hotel._id}`)).status).toBe(401);

      const auth = await login();
      const created = await request(app).post('/api/hotels').set('Authorization', auth)
        .send({ name: 'New Hotel', stars: 4, services: 'Wifi;Pool', lng: 1, lat: 2 });
      expect(created.status).toBe(201);
      expect(created.body.services).toEqual(['Wifi', 'Pool']);
      expect((await request(app).delete(`/api/hotels/${created.body._id}`).set('Authorization', auth)).status).toBe(204);
    });
  });

  describe('users', () => {
    it('registers without returning the password hash', async () => {
      const res = await request(app).post('/api/users/register').send({ username: 'Bob', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body.username).toBe('bob');
      expect(res.body.password).toBeUndefined();
    });

    it('rejects short passwords and duplicate usernames', async () => {
      expect((await request(app).post('/api/users/register').send({ username: 'bob', password: 'short' })).status).toBe(400);
      await request(app).post('/api/users/register').send({ username: 'bob', password: 'password123' });
      expect((await request(app).post('/api/users/register').send({ username: 'BOB', password: 'password123' })).status).toBe(409);
    });

    it('returns 401 (not a crash) for unknown users and wrong passwords', async () => {
      expect((await request(app).post('/api/users/login').send({ username: 'nobody', password: 'x' })).status).toBe(401);
      await request(app).post('/api/users/register').send({ username: 'bob', password: 'password123' });
      expect((await request(app).post('/api/users/login').send({ username: 'bob', password: 'wrong-pass' })).status).toBe(401);
    });

    it('rejects tampered tokens', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      const res = await request(app).post(`/api/hotels/${hotel._id}/reviews`).set('Authorization', 'Bearer abc.def.ghi').send({ rating: 5, review: 'x' });
      expect(res.status).toBe(401);
    });
  });

  describe('reviews', () => {
    it('adds a review as the logged-in user', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      const auth = await login('carol');
      const res = await request(app).post(`/api/hotels/${hotel._id}/reviews`).set('Authorization', auth)
        .send({ name: 'someone-else', rating: 5, review: 'Lovely' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('carol');
      expect(res.body.username).toBe('carol');
    });

    it('validates rating', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      const auth = await login();
      const res = await request(app).post(`/api/hotels/${hotel._id}/reviews`).set('Authorization', auth).send({ rating: 9, review: 'x' });
      expect(res.status).toBe(400);
    });

    it('only lets authors edit or delete their reviews', async () => {
      const [hotel] = (await request(app).get('/api/hotels')).body;
      const alice = await login('alice');
      const mallory = await login('mallory');
      const review = (await request(app).post(`/api/hotels/${hotel._id}/reviews`).set('Authorization', alice).send({ rating: 4, review: 'Good' })).body;
      const url = `/api/hotels/${hotel._id}/reviews/${review._id}`;

      expect((await request(app).put(url).send({ rating: 1, review: 'x' })).status).toBe(401);
      expect((await request(app).put(url).set('Authorization', mallory).send({ rating: 1, review: 'Bad' })).status).toBe(403);
      expect((await request(app).delete(url).set('Authorization', mallory)).status).toBe(403);

      expect((await request(app).put(url).set('Authorization', alice).send({ rating: 5, review: 'Great' })).status).toBe(204);
      expect((await request(app).get(url)).body.review).toBe('Great');
      expect((await request(app).delete(url).set('Authorization', alice)).status).toBe(204);
      expect((await request(app).get(url)).status).toBe(404);
    });
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Not found');
  });
});
