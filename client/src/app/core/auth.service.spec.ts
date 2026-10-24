import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService, decodeToken } from './auth.service';

const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
const tokenFor = (username: string, exp = Math.floor(Date.now() / 1000) + 3600) => `h.${b64({ username, exp })}.s`;

describe('decodeToken', () => {
  it('reads the payload and rejects garbage', () => {
    expect(decodeToken(tokenFor('ann', 123))).toEqual({ username: 'ann', exp: 123 });
    expect(decodeToken('nope')).toBeNull();
    expect(decodeToken(null)).toBeNull();
  });
});

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('logs in, sends the token, and logs out', () => {
    expect(auth.isLoggedIn()).toBe(false);
    auth.login('ann', 'password123').subscribe();
    http.expectOne('/api/users/login').flush({ success: true, token: tokenFor('ann') });
    expect(auth.username()).toBe('ann');

    TestBed.inject(HttpClient).get('/api/hotels').subscribe();
    expect(http.expectOne('/api/hotels').request.headers.get('Authorization')).toMatch(/^Bearer /);

    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('treats an expired token as logged out', () => {
    auth.login('ann', 'password123').subscribe();
    http.expectOne('/api/users/login').flush({ success: true, token: tokenFor('ann', 1) });
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('logs out when the API rejects the token', () => {
    auth.login('ann', 'password123').subscribe();
    http.expectOne('/api/users/login').flush({ success: true, token: tokenFor('ann') });
    TestBed.inject(HttpClient).get('/api/hotels').subscribe({ error: () => undefined });
    http.expectOne('/api/hotels').flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isLoggedIn()).toBe(false);
  });
});
