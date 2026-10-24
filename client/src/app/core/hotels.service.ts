import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Hotel, Review } from './models';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private readonly http = inject(HttpClient);

  list(offset = 0, count = 10): Observable<Hotel[]> {
    return this.http.get<Hotel[]>('/api/hotels', { params: { offset, count } });
  }

  get(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`/api/hotels/${id}`);
  }

  addReview(hotelId: string, review: { rating: number; review: string }): Observable<Review> {
    return this.http.post<Review>(`/api/hotels/${hotelId}/reviews`, review);
  }

  deleteReview(hotelId: string, reviewId: string): Observable<void> {
    return this.http.delete<void>(`/api/hotels/${hotelId}/reviews/${reviewId}`);
  }
}
