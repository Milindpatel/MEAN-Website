import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../core/auth.interceptor';
import { HotelsService } from '../core/hotels.service';
import { Hotel } from '../core/models';
import { StarRating } from './star-rating';

const PAGE_SIZE = 5;

@Component({
  selector: 'app-hotel-list',
  imports: [RouterLink, StarRating],
  template: `
    <h1>Hotels</h1>
    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }
    <div class="list-group mb-3">
      @for (hotel of hotels(); track hotel._id) {
        <a class="list-group-item list-group-item-action" [routerLink]="['/hotels', hotel._id]">
          <strong>{{ hotel.name }}</strong> <app-star-rating [stars]="hotel.stars" />
          <div class="small text-muted">{{ hotel.location?.address }}</div>
        </a>
      } @empty {
        @if (!loading()) {
          <p class="text-muted">No hotels found.</p>
        }
      }
    </div>
    <nav class="d-flex gap-2" aria-label="Pages">
      <button class="btn btn-outline-secondary" type="button" [disabled]="offset() === 0" (click)="load(offset() - pageSize)">Previous</button>
      <button class="btn btn-outline-secondary" type="button" [disabled]="hotels().length < pageSize" (click)="load(offset() + pageSize)">Next</button>
    </nav>
  `,
})
export class HotelListPage {
  private readonly hotelsService = inject(HotelsService);
  readonly pageSize = PAGE_SIZE;
  readonly hotels = signal<Hotel[]>([]);
  readonly offset = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load(0);
  }

  load(offset: number): void {
    this.loading.set(true);
    this.hotelsService.list(offset, PAGE_SIZE).subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        this.offset.set(offset);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }
}
