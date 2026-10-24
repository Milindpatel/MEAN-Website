import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { errorMessage } from '../core/auth.interceptor';
import { HotelsService } from '../core/hotels.service';
import { Hotel } from '../core/models';
import { StarRating } from './star-rating';

@Component({
  selector: 'app-hotel-detail',
  imports: [DatePipe, FormsModule, RouterLink, StarRating],
  templateUrl: './hotel-detail.html',
})
export class HotelDetailPage {
  private readonly hotelsService = inject(HotelsService);
  protected readonly auth = inject(AuthService);

  /** Route parameter (bound with withComponentInputBinding). */
  readonly id = input.required<string>();
  readonly hotel = signal<Hotel | null>(null);
  readonly error = signal<string | null>(null);
  readonly reviewError = signal<string | null>(null);
  readonly saving = signal(false);

  rating = 5;
  review = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.hotelsService.get(this.id()).subscribe({
      next: (hotel) => this.hotel.set(hotel),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  addReview(): void {
    if (!this.review.trim()) {
      this.reviewError.set('Please write a review.');
      return;
    }
    this.saving.set(true);
    this.hotelsService.addReview(this.id(), { rating: this.rating, review: this.review.trim() }).subscribe({
      next: () => {
        this.review = '';
        this.rating = 5;
        this.reviewError.set(null);
        this.saving.set(false);
        this.reload();
      },
      error: (err) => {
        this.reviewError.set(errorMessage(err));
        this.saving.set(false);
      },
    });
  }

  deleteReview(reviewId: string): void {
    if (!confirm('Delete your review?')) return;
    this.hotelsService.deleteReview(this.id(), reviewId).subscribe({
      next: () => this.reload(),
      error: (err) => this.reviewError.set(errorMessage(err)),
    });
  }
}
