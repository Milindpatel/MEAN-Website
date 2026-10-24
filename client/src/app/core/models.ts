export interface Review {
  _id: string;
  name: string;
  username?: string;
  rating: number;
  review: string;
  createdOn: string;
}

export interface Hotel {
  _id: string;
  name: string;
  stars: number;
  description?: string;
  services: string[];
  photos: string[];
  currency?: string;
  location?: { address?: string; coordinates?: [number, number] };
  reviews?: Review[];
}
