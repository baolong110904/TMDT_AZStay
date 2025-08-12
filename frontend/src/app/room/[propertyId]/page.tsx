"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoomProps } from "@/components/Type/RoomProp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeartButton } from "@/components/HeartButtons";
import ImagePreview from "@/components/Room/ImagePreview";
import BiddingBox from "@/components/Room/BiddingBox";
import api from "@/lib/axios"; // ✅ dùng api custom thay vì axios

export default function Room() {
  const params = useParams();

  const propertyId = params?.propertyId as string;

  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<RoomProps | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    console.log("🌀 useEffect triggered, propertyId:", propertyId);

    if (!propertyId) {
      console.warn("⚠️ No propertyId found, skipping fetch.");
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      console.log("🌐 Fetching property data from API...");
      console.log("🔗 API URL:", `/properties/${propertyId}`);

      try {
        const res = await api.get(`/properties/${propertyId}`);
        console.log("✅ API response:", res.data);
      
        const mappedProperty: RoomProps = {
          ...res.data,
          imgUrl: res.data.propertyimage?.map((img: any) => img.image_url) || [],
          ownerName: res.data.user?.name || "Unknown host",
          ownerImgUrl: res.data.user?.avatar || "/placeholder.jpg",
          availableDate: res.data.checkin_date && res.data.checkout_date
          ? [res.data.checkin_date, res.data.checkout_date]
          : ["2025-08-12", "2025-08-15"],
          minPrice: Number(res.data.min_price ?? 0),
          currentPrice: Number(
            res.data.auction?.[0]?.final_price ?? res.data.min_price ?? 0
          ),
          biddingStartTime: res.data.auction?.[0]?.start_time
            ? new Date(res.data.auction[0].start_time)
            : new Date("2025-08-07T08:00:00"),
          biddingEndTime: res.data.auction?.[0]?.end_time
            ? new Date(res.data.auction[0].end_time)
            : new Date("2025-08-07T20:00:00"),
        };
      
        setProperty(mappedProperty);
      } catch (err) {
        console.error("❌ Failed to fetch property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        Property not found
      </div>
    );
  }

  return (
    <div className="max-w-screen">
      <Header />

      <div className="px-60 py-6">
        {/* Titles and heart button */}
        <div className="text-3xl font-semibold flex items-center justify-between">
          <h1>{property.title}</h1>
          <HeartButton
            isFavorite={isFavorite}
            size={40}
            onToggle={toggleFavorite}
          />
        </div>

        {/* Images preview */}
        <div className="pt-6">
          <ImagePreview imgUrls={property.imgUrl || []} />
        </div>
      </div>

      <div className="px-60 py-6 flex flex-col lg:flex-row gap-10">
        {/* LEFT */}
        <div className="lg:w-2/3 w-full">
          <div className="py-5 space-y-4">
            <p className="font-bold text-2xl">{property.address}</p>
            <div className="flex items-center gap-4">
              <img
                src={property.ownerImgUrl}
                alt={property.ownerName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p className="font-medium text-lg">
                Hosted by {property.ownerName}
              </p>
            </div>
            <p className="font-semibold">About this place</p>
            <p>{property.description}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-1/3 w-full">
          {property.availableDate && property.availableDate.length >= 2 && (
            <BiddingBox
              startPrice={property.minPrice}
              currentPrice={property.currentPrice}
              availableDateStart={new Date(property.availableDate[0])}
              availableDateEnd={new Date(property.availableDate[1])}
              biddingStartTime={property.biddingStartTime}
              biddingEndTime={property.biddingEndTime}
              onConfirmBid={(price, dates) => {
                console.log(
                  `💰 Bidded ${price} for ${dates[0].toDateString()} - ${dates[1].toDateString()}`
                );
                alert(
                  `Bidded ${price} for ${dates[0].toDateString()} - ${dates[1].toDateString()}`
                );
              }}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
