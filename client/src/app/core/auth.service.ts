import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

const TOKEN_KEY = 'token';

interface TokenPayload {
  username: string;
  exp: number;
}

/** Decodes the JWT payload (no verification; the API does that). */
export function decodeToken(token: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(readToken());

  private readonly payload = computed(() => decodeToken(this.token()));
  readonly username = computed(() => {
    const p = this.payload();
    return p && p.exp * 1000 > Date.now() ? p.username : null;
  });
  readonly isLoggedIn = computed(() => this.username() !== null);

  getToken(): string | null {
    return this.isLoggedIn() ? this.token() : null;
  }

  login(username: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>('/api/users/login', { username, password }).pipe(
      map(({ token }) => {
        sessionStorage.setItem(TOKEN_KEY, token);
        this.token.set(token);
      }),
    );
  }

  register(username: string, password: string): Observable<unknown> {
    return this.http.post('/api/users/register', { username, password });
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
  }
}
