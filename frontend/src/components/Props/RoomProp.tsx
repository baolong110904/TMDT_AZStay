export interface RoomProps{
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

  auctionId: string
  biddingStartTime: Date;
  biddingEndTime: Date;

  averageRating?: number;
  reviewCount?: number;

  minPrice: number;
  currentPrice: number;
  currentPriceUserId: string;
}