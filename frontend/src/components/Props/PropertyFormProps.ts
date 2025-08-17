export interface PropertyFormData {
  user_id: string; // Changed to string to match UserProfile.id and UUID format
  category_id: number;
  title: string;
  description: string;
  address: string;
  ward: string;
  province: string;
  country: string;
  max_guest: number;
  min_price: number;
  images?: File[];
}