import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <h1>Profile</h1>
    <p>You are logged in as <strong>{{ auth.username() }}</strong>.</p>
  `,
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
}
