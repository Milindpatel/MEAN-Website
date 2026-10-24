import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { errorMessage } from '../core/auth.interceptor';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  template: `
    <h1>Register</h1>
    @if (message()) {
      <div class="alert alert-success" role="status">{{ message() }}</div>
    } @else {
      @if (error()) {
        <div class="alert alert-danger" role="alert">{{ error() }}</div>
      }
      <form class="col-md-5" (ngSubmit)="register()">
        <div class="mb-3">
          <label class="form-label" for="username">Username</label>
          <input id="username" class="form-control" name="username" autocomplete="username" autocapitalize="none" [(ngModel)]="username" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Password (at least 8 characters)</label>
          <input id="password" type="password" class="form-control" name="password" autocomplete="new-password" [(ngModel)]="password" />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password-repeat">Repeat password</label>
          <input id="password-repeat" type="password" class="form-control" name="passwordRepeat" autocomplete="new-password" [(ngModel)]="passwordRepeat" />
        </div>
        <button type="submit" class="btn btn-success">Register</button>
      </form>
    }
  `,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  username = '';
  password = '';
  passwordRepeat = '';
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  register(): void {
    if (!this.username || !this.password) return this.error.set('Please add a username and password.');
    if (this.password.length < 8) return this.error.set('Password must be at least 8 characters.');
    if (this.password !== this.passwordRepeat) return this.error.set('Please make sure the passwords match.');

    this.auth.register(this.username, this.password).subscribe({
      next: () => this.message.set('Registration successful. Please log in.'),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
