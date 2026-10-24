import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  it('renders filled and empty stars, clamped to 0-5', async () => {
    const fixture = TestBed.createComponent(StarRating);
    fixture.componentRef.setInput('stars', 3);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('★★★☆☆');

    fixture.componentRef.setInput('stars', 9);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('★★★★★');
  });
});
