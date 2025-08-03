export interface Listing {
  id: string;
  title: string;
  category: string; // dung cho filter
  externalService: string; // dung cho filter
  price: number // dung cho filter
  currency: string;
  address?: string;
  checkInDate?: Date; // dung cho filter
  checkOutDate?: Date; // dung cho filter
  image?: { url: string };
  reviewStat?: { rating: number; count: number }; // dung cho filter
  isActive: boolean; // dung cho filter
}