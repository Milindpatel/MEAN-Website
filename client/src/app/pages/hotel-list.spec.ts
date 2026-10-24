import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HotelListPage } from './hotel-list';

describe('HotelListPage', () => {
  it('shows hotels and pages forward', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(HotelListPage);

    const hotels = Array.from({ length: 5 }, (_, i) => ({ _id: `${i}`, name: `Hotel ${i}`, stars: 3, services: [], photos: [] }));
    http.expectOne((r) => r.url === '/api/hotels' && r.params.get('offset') === '0').flush(hotels);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.list-group-item').length).toBe(5);

    (el.querySelectorAll('nav button')[1] as HTMLButtonElement).click();
    http.expectOne((r) => r.params.get('offset') === '5').flush([hotels[0]]);
    await fixture.whenStable();
    expect(el.querySelectorAll('.list-group-item').length).toBe(1);
    http.verify();
  });
});
