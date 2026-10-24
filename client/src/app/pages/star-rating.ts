import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  template: `<span class="text-warning" [attr.aria-label]="stars() + ' out of 5 stars'" role="img">{{ display() }}</span>`,
})
export class StarRating {
  readonly stars = input(0);
  readonly display = computed(() => {
    const n = Math.max(0, Math.min(5, Math.round(this.stars())));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  });
}
