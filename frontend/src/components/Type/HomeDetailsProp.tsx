export interface HomeDetailsProps{
  propertyId: string;

  title: string;
  description: string;

  imgUrl: string[];

  ownerName: string;
  ownerImgUrl: string;
  categoryName: string;

  address: string;
  ward: string;
  province: string;
  latitude?: number;
  longitude?: number;

  roomNumber: number;
  isAvailable: boolean;
  availableDate?: Date[];

  averageRating?: number;
  reviewCount?: number;

  minPrice: number;
  currentPrice: number;
}