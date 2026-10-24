import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/auth.service';
import { errorMessage } from './core/auth.interceptor';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-md bg-body-tertiary fixed-top border-bottom">
      <div class="container">
        <a class="navbar-brand" routerLink="/">MeanHotel</a>
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><a class="nav-link" routerLink="/hotels" routerLinkActive="active">Hotels</a></li>
          @if (auth.isLoggedIn()) {
            <li class="nav-item"><a class="nav-link" routerLink="/profile" routerLinkActive="active">Profile</a></li>
          } @else {
            <li class="nav-item"><a class="nav-link" routerLink="/register" routerLinkActive="active">Register</a></li>
          }
        </ul>
        @if (auth.isLoggedIn()) {
          <span class="navbar-text me-2">Welcome back {{ auth.username() }}</span>
          <button class="btn btn-sm btn-outline-secondary" type="button" (click)="logout()">Logout</button>
        } @else {
          <form class="d-flex gap-2" (ngSubmit)="login()">
            <input class="form-control form-control-sm" [class.is-invalid]="error()" name="username" placeholder="Username"
              aria-label="Username" autocomplete="username" autocapitalize="none" [(ngModel)]="username" />
            <input class="form-control form-control-sm" [class.is-invalid]="error()" type="password" name="password"
              placeholder="Password" aria-label="Password" autocomplete="current-password" [(ngModel)]="password" />
            <button type="submit" class="btn btn-sm btn-success">Login</button>
          </form>
        }
      </div>
    </nav>
    @if (error()) {
      <div class="container login-error"><div class="alert alert-danger py-1">{{ error() }}</div></div>
    }
  `,
})
export class Nav {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  readonly error = signal<string | null>(null);

  login(): void {
    if (!this.username || !this.password) return;
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.username = this.password = '';
        this.error.set(null);
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
