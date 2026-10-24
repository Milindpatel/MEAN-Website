import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="p-5 mb-4 bg-body-tertiary rounded-3">
      <h1 class="display-5">MEAN Hotel</h1>
      <p class="lead">Browse hotels, read reviews, and log in to share your own.</p>
      <a class="btn btn-primary btn-lg" routerLink="/hotels">Browse hotels</a>
    </div>
  `,
})
export class HomePage {}
