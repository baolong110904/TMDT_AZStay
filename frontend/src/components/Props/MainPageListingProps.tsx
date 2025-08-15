export interface Listing {
  title: string | null;
  price: string | null;
  image: string | null;
  url: string | null;
  rating: string | null;
  reviewsCount: string | null;
  locationHint?: string | null;
}