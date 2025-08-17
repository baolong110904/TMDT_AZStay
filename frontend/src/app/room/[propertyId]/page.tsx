"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RoomProps } from "@/components/Props/RoomProp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeartButton } from "@/components/HeartButtons";
import ImagePreview from "@/components/Room/ImagePreview";
import BiddingBox from "@/components/Room/BiddingBox";
import ReviewsSection from "@/components/Room/ReviewsSection";
import MapDisplay from "@/components/Room/MapDisplay";
import api from "@/lib/axios";

export default function Room() {
  const params = useParams();
  const propertyId = params?.propertyId as string;

  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<RoomProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [userId, setUserId] = useState<string>(""); 

  // Reviews
  const [reviewsData, setReviewsData] = useState<any>(null);

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  // 🆕 Lấy user_id từ localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.user_id) {
          setUserId(parsed.user_id);
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse user from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        console.log(res.data);
        const mappedProperty: RoomProps = {
          ...res.data,
          imgUrl: res.data.propertyimage?.map((img: any) => img.image_url) || [],
          latitude: Number(res.data.latitude) || undefined,
          longitude: Number(res.data.longitude) || undefined,
          ownerName: res.data.user?.name || "Unknown host",
          ownerImgUrl: res.data.user?.avatar_url || "/placeholder.jpg",
          availableDate: res.data.checkin_date && res.data.checkout_date
            ? [res.data.checkin_date, res.data.checkout_date]
            : ["2025-08-12", "2025-08-15"],
          minPrice: Number(res.data.min_price ?? 0),
          currentPrice: Number(res.data.auction?.[0]?.final_price ?? res.data.min_price ?? 0),
          currentPriceUserId: res.data.auction?.[0]?.winner_id,
          currentPriceTime: res.data.auction?.[0]?.updated_at,
          auctionId: res.data.auction?.[0]?.auction_id,
          biddingStartTime: res.data.auction?.[0]?.start_time ? new Date(res.data.auction[0].start_time) : new Date(),
          biddingEndTime: res.data.auction?.[0]?.end_time ? new Date(res.data.auction[0].end_time) : new Date(),
        };
        setProperty(mappedProperty);
      } catch (err) {
        console.error("❌ Failed to fetch property:", err);
      }
    };

  // debug log removed to avoid unnecessary rerenders

    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${propertyId}`);
        setReviewsData({
          overallRating: res.data.rating,
          totalReviews: res.data.count,
          reviews: res.data.details.map((d: any) => ({
            id: d.id,
            userName: d.user?.name ?? "Guest",
            avatar: d.user?.avatar_url ?? "/placeholder-avatar.jpg",
            rating: d.overall_rating,
            date: new Date(d.created_at).toLocaleString("en-US", { month: "long", year: "numeric" }),
            comment: d.comment,
          })),
          ratings: {
            cleanliness: res.data.cleanliness_avg,
            accuracy: res.data.accuracy_avg,
            checkin: res.data.checkin_avg,
            communication: res.data.communication_avg,
            location: res.data.location_avg,
            value: res.data.value_avg,
          },
        });
      } catch (err) {
        console.error("❌ Failed to fetch reviews:", err);
      }
    };

    Promise.all([fetchProperty(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
  }, [propertyId]);

  // fetch coords fallback
  useEffect(() => {
    const address = property?.address || "";
    if (!address) return;
    if (typeof property?.latitude === "number" && typeof property?.longitude === "number") {
      setCoords(null);
      setCoordsLoading(false);
      return;
    }
    setCoordsLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCoords({ latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) });
        } else {
          setCoords(null);
        }
      })
      .catch(err => {
        console.error("Failed to fetch coordinates:", err);
        setCoords(null);
      })
      .finally(() => setCoordsLoading(false));
  }, [property?.address, property?.latitude, property?.longitude]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!property) {
    return <div className="flex justify-center items-center h-screen">Property not found</div>;
  }

  return (
    <div className="max-w-screen">
      <Header />

      <div className="px-60 py-6">
        <div className="text-3xl font-semibold flex items-center justify-between">
          <h1>{property.title}</h1>
          <HeartButton isFavorite={isFavorite} size={40} onToggle={toggleFavorite} />
        </div>
        <div className="pt-6">
          <ImagePreview imgUrls={property.imgUrl || []} />
        </div>
      </div>

      <div className="px-60 py-6 flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3 w-full">
          <div className="py-5 space-y-4">
            <p className="font-bold text-2xl">{property.address}</p>
            <div className="flex items-center gap-4">
              <img src={property.ownerImgUrl} alt={property.ownerName} className="w-12 h-12 rounded-full object-cover" />
              <p className="font-medium text-lg">Hosted by {property.ownerName}</p>
            </div>
            <p className="font-semibold">About this place</p>
            <p>{property.description}</p>
          </div>
        </div>

        <div className="lg:w-1/3 w-full">
          {property.availableDate && property.availableDate.length >= 2 && (
            <BiddingBox
              startPrice={property.minPrice}
              currentPrice={property.currentPrice}
              currentPriceUserId={property.currentPriceUserId}
              currentPriceTime={new Date(property.currentPriceTime)}
              availableDateStart={new Date(property.availableDate[0])}
              availableDateEnd={new Date(property.availableDate[1])}
              biddingStartTime={new Date(property.biddingStartTime)}
              biddingEndTime={new Date(property.biddingEndTime)}
              auctionId={property.auctionId}
              userId={userId}
            />
          )}
        </div>
      </div>

      <div className="px-60 py-6">
        {reviewsData && (
          <ReviewsSection
            overallRating={reviewsData.overallRating}
            totalReviews={reviewsData.totalReviews}
            reviews={reviewsData.reviews}
            ratings={reviewsData.ratings}
          />
        )}
      </div>

      <div className="w-2/3 h-px bg-gray-300 opacity-50 my-10 mx-auto"></div>

      <div className="px-60 py-0">
        {property.latitude != null && property.longitude != null && !isNaN(property.latitude) && !isNaN(property.longitude) ? (
          <MapDisplay latitude={property.latitude} longitude={property.longitude} address={property.address} />
        ) : coordsLoading ? (
          <div>Loading map…</div>
        ) : coords ? (
          <MapDisplay latitude={coords.latitude} longitude={coords.longitude} address={property.address} />
        ) : (
          <div>Không tìm thấy vị trí trên bản đồ.</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
