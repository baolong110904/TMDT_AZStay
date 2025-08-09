interface Listing {
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

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Căn hộ cao cấp Quận 1",
    category: "Căn hộ",
    externalService: "Airbnb",
    price: 1200000,
    currency: "VND",
    address: "Quận 1, TP.HCM",
    checkInDate: new Date("2025-08-10"),
    checkOutDate: new Date("2025-08-15"),
    image: { url: "https://picsum.photos/id/1/400/300" },
    reviewStat: { rating: 4.7, count: 32 },
    isActive: true,
  },
  {
    id: "2",
    title: "Phòng đơn giá rẻ Gò Vấp",
    category: "Phòng",
    externalService: "Booking",
    price: 350000,
    currency: "VND",
    address: "Gò Vấp, TP.HCM",
    checkInDate: new Date("2025-08-05"),
    checkOutDate: new Date("2025-08-09"),
    image: { url: "https://picsum.photos/id/2/400/300" },
    reviewStat: { rating: 4.1, count: 15 },
    isActive: true,
  },
  {
    id: "3",
    title: "Biệt thự nghỉ dưỡng Đà Lạt",
    category: "Biệt thự",
    externalService: "Luxstay",
    price: 2500000,
    currency: "VND",
    address: "Phường 4, Đà Lạt",
    checkInDate: new Date("2025-09-01"),
    checkOutDate: new Date("2025-09-10"),
    image: { url: "https://picsum.photos/id/3/400/300" },
    reviewStat: { rating: 4.9, count: 80 },
    isActive: true,
  },
  {
    id: "4",
    title: "Nhà nguyên căn cho gia đình",
    category: "Nhà nguyên căn",
    externalService: "Airbnb",
    price: 1800000,
    currency: "VND",
    address: "Bình Thạnh, TP.HCM",
    checkInDate: new Date("2025-08-20"),
    checkOutDate: new Date("2025-08-30"),
    image: { url: "https://picsum.photos/id/4/400/300" },
    reviewStat: { rating: 4.5, count: 45 },
    isActive: false,
  },
  {
    id: "5",
    title: "Căn hộ studio trung tâm Hà Nội",
    category: "Căn hộ",
    externalService: "Booking",
    price: 950000,
    currency: "VND",
    address: "Hoàn Kiếm, Hà Nội",
    checkInDate: new Date("2025-08-08"),
    checkOutDate: new Date("2025-08-14"),
    image: { url: "https://picsum.photos/id/6/400/300" },
    reviewStat: { rating: 4.3, count: 21 },
    isActive: true,
  },
  // Generate from 6 to 30
  ...Array.from({ length: 25 }, (_, i) => {
    const index = i + 6;
    const categories = ["Căn hộ", "Phòng", "Biệt thự", "Nhà nguyên căn"];
    const services = ["Airbnb", "Booking", "Luxstay"];
    const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0 - 5.0
    const price = Math.floor(Math.random() * 2000000 + 300000);
    const count = Math.floor(Math.random() * 100 + 1);
    const active = Math.random() > 0.2;
    const category = categories[i % categories.length];
    const externalService = services[i % services.length];

    return {
      id: `${index}`,
      title: `${category} ${index} tại vị trí đẹp`,
      category,
      externalService,
      price,
      currency: "VND",
      address: `Quận ${i % 12 + 1}, TP.HCM`,
      checkInDate: new Date(`2025-08-${(i % 28) + 1}`),
      checkOutDate: new Date(`2025-08-${(i % 28) + 3}`),
      image: {
        url: `https://picsum.photos/id/${index}/400/300`,
      },
      reviewStat: { rating, count },
      isActive: active,
    };
  }),
];