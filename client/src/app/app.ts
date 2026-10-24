import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Nav } from './nav';

@Component({
  selector: 'app-root',
  imports: [Nav, RouterOutlet],
  template: `
    <app-nav />
    <main class="container">
      <router-outlet />
    </main>
    <footer class="footer text-center text-muted">
      <img src="PandaWizard.png" height="26" alt="Full Stack Training" />
      <p><small>&copy; 2017–{{ year }} Milind M. Patel</small></p>
    </footer>
  `,
})
export class App {
  readonly year = new Date().getFullYear();
}
