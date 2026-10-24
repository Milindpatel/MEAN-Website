# MEAN Hotel

A MEAN stack (MongoDB, Express, Angular, Node.js) hotel reviews app, originally built during Full Stack Training. Browse hotels, read reviews, register and log in to add your own.

![CI](https://github.com/Milindpatel/MEAN-Website/actions/workflows/ci.yml/badge.svg)

## Features

- Hotel list with paging; hotel details with services and reviews.
- Register / log in (bcrypt-hashed passwords, JWT auth).
- Add reviews when logged in; delete your own reviews.
- "Hotels near me" API: `GET /api/hotels?lat=47.5&lng=19.06`.

## Tech stack

Node.js 24, Express 5, Mongoose 9, Angular 22 (standalone, zoneless, signals), Bootstrap 5, Vitest + Supertest + mongodb-memory-server.

## Getting started

Requires Node.js 22.22.3+ and MongoDB.

```bash
cp .env.example .env                 # set MONGODB_URI (and JWT_SECRET for production)
npm install
npm run seed                         # load sample hotels from api/data/hotel-data.json

# Option 1: build the Angular app once and serve everything from Express
npm --prefix client install
npm run build
npm start                            # http://localhost:3000

# Option 2: develop the client with live reload (proxies /api to :3000)
npm start                            # in one terminal
cd client && npm start               # http://localhost:4200
```

Load the `.env` values into your shell before starting (for example `set -a; source .env; set +a`).

## API

| Method | Route | Auth |
| --- | --- | --- |
| GET | `/api/hotels?offset=0&count=5` (max 10) or `?lat=&lng=` | – |
| GET | `/api/hotels/:hotelId` | – |
| POST / PUT / DELETE | `/api/hotels[/:hotelId]` | logged in |
| GET | `/api/hotels/:hotelId/reviews[/:reviewId]` | – |
| POST | `/api/hotels/:hotelId/reviews` | logged in |
| PUT / DELETE | `/api/hotels/:hotelId/reviews/:reviewId` | review author |
| POST | `/api/users/register`, `/api/users/login` | – |

## Tests

```bash
npm test                              # API tests (in-memory MongoDB)
cd client && npm test                 # Angular unit tests
```

## Project layout

```
server.js / app.js     Express entry point and app factory
api/                   routes, controllers, Mongoose models, auth middleware
client/                Angular app (builds into public/)
scripts/seed.js        sample data loader
test/                  API tests
```
