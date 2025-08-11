"use client";

import { useState } from "react";
import { HomeDetailsProps } from "@/components/Type/HomeDetailsProp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeartButton } from "@/components/HeartButtons";
import ImagePreview from "@/components/HomeDetails/ImagePreview";
import BiddingBox from "@/components/HomeDetails/BiddingBox";

const mockHome: HomeDetailsProps = {
  propertyId: "1",
  title: "Studio Lake View/Sunset glow in your eyes",
  description: `This is a fully furnished Studio apartment inside a 6-storey building located next to the poetic West Lake. The sophisticated design with an open space and a large balcony helps to capture natural light and a panoramic view of the lake, especially beautiful at sunrise and sunset.
The minimalist furniture includes: a soft bed, a personal desk, a comfortable kitchen, and a modern private bathroom.
The private balcony is the ideal highlight for relaxing. Suitable for individuals or couples who want to enjoy the peaceful living space by West Lake.`,
  imgUrl: [
    "https://fastly.picsum.photos/id/35/2758/3622.jpg?hmac=xIB3RTEGJ59FEnaQOXoaDgwX_K6PHAg57R0b4t7tiX0",
    "https://fastly.picsum.photos/id/34/3872/2592.jpg?hmac=4o5QGDd7eVRX8_ISsc5ZzGrHsFYDoanmcsz7kyu8A9A",
    "https://fastly.picsum.photos/id/46/3264/2448.jpg?hmac=ZHE8nk-Q9uRp4MxgKNvN7V7pYFvA-9BCv99ltY3HBv4",
    "https://fastly.picsum.photos/id/45/4592/2576.jpg?hmac=Vc7_kMYufvy96FxocZ1Zx6DR1PNsNQXF4XUw1mZ2dlc",
    "https://fastly.picsum.photos/id/47/4272/2848.jpg?hmac=G8dXSLa-ngBieraQt5EORu-4r6tveX3fhvBTZM0Y8xM",
  ],
  ownerName: "Bui Minh Quan",
  ownerImgUrl:
    "https://media.tenor.com/FLfJEQ0Q8wQAAAAe/rigby-freaky.png",
  categoryName: "Villa",
  address: "123 Le Duan Ward Sai Gon Ho Chi Minh City",
  ward: "Sai Gon",
  province: "Ho Chi Minh",
  latitude: 10.7769,
  longitude: 106.7009,
  roomNumber: 2,
  isAvailable: true,
  availableDate: [new Date("2025-08-07"), new Date("2025-08-12")],
  averageRating: 4.8,
  reviewCount: 32,
  minPrice: 450000,
  currentPrice: 510000,
};

export default function HomeDetails() {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  return (
    <div className="max-w-screen">
      <Header />

      <div className="px-60 py-6">
        {/* Titles and heart button */}
        <div className="text-3xl font-semibold flex items-center justify-between">
          <h1>{mockHome.title}</h1>
          <HeartButton
            isFavorite={isFavorite}
            size={40}
            onToggle={toggleFavorite}
          />
        </div>

        {/* Images preview */}
        <div className="pt-6">
          <ImagePreview imgUrls={mockHome.imgUrl} />
        </div>
      </div>

      <div className="px-60 py-6 flex flex-col lg:flex-row gap-10">
        {/* LEFT: Main content */}
        <div className="lg:w-2/3 w-full">
          {/* onwer info with picture profile */}

          {/* Info */}
          <div className="py-5 space-y-4">
            <p className="font-bold text-2xl">{mockHome.address}</p>
            <div className="flex items-center gap-4">
              <img
                src={mockHome.ownerImgUrl}
                alt={mockHome.ownerName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="font-medium text-lg">
                Hosted by {mockHome.ownerName}
              </p>
            </div>
            <p className="font-semibold">About this place</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
            <p>{mockHome.description}</p>
          </div>
        </div>

        {/* RIGHT: Bidding Box */}
        <div className="lg:w-1/3 w-full">
          {mockHome.availableDate && (
            <BiddingBox
              startPrice={mockHome.minPrice}
              currentPrice={mockHome.currentPrice}
              availableDateStart={mockHome.availableDate[0]}
              availableDateEnd={mockHome.availableDate[1]}
              biddingStartTime={new Date("2025-08-07T08:00:00")}
              biddingEndTime={new Date("2025-08-07T20:00:00")}
              onConfirmBid={(price, dates) =>
                alert(
                  `Bidded ${price} for ${dates[0].toDateString()} - ${dates[1].toDateString()}`
                )
              }
            />
          )}
        </div>
      </div>

      <div></div>
      <Footer />
    </div>
  );
}
