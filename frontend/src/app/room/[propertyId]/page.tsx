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

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      return !prev;
    });
  };


  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        const mappedProperty: RoomProps = {
          ...res.data,
          imgUrl: res.data.propertyimage?.map((img: any) => img.image_url) || [],
          latitude: typeof res.data.latitude === "number" ? res.data.latitude : (res.data.latitude ? Number(res.data.latitude) : undefined),
          longitude: typeof res.data.longitude === "number" ? res.data.longitude : (res.data.longitude ? Number(res.data.longitude) : undefined),
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

  // Nếu property không có latitude/longitude, fallback sang Nominatim 
  useEffect(() => {
    const address = property?.address || "";
    const lat = property?.latitude;
    const lon = property?.longitude;
    if (!address) return;
    if (typeof lat === "number" && typeof lon === "number") {
      setCoords(null);
      setCoordsLoading(false);
      return;
    }
    setCoordsLoading(true);
    const fetchCoords = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setCoords({
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          });
        } else {
          setCoords(null);
        }
      } catch (err) {
        console.error("Failed to fetch coordinates:", err);
        setCoords(null);
      } finally {
        setCoordsLoading(false);
      }
    };
    fetchCoords();
  }, [property?.address, property?.latitude, property?.longitude]);

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

      {/* Reviews Section - Full Width */}
      <div className="px-60 py-6">
        <ReviewsSection
          overallRating={5.0}
          totalReviews={127}
          reviews={[
            {
              id: "1",
              userName: "Bic",
              userLocation: "Manalapan Township, New Jersey",
              rating: 5,
              date: "June 2025",
              comment:
                "This apartment is one of the best Airbnb that we have stayed at anywhere so far. The host is very responsive and nice. The place is beautiful decorated and spacious and at center. We would definitely stay here again! Highly recommended for anyone visiting the area.",
            },
            {
              id: "2",
              userName: "Van",
              userLocation: "Colbert, Washington",
              rating: 5,
              date: "1 day ago",
              tripType: "Group trip",
              comment:
                "Uyển place was wonderful. Walking distance to city center and night market, it's exactly as described, quite and peaceful. The rooms were comfortable and clean. Uyển is a great host and very helpful.",
            },
            {
              id: "3",
              userName: "Dayna",
              userLocation: "Pleasant Hill, California",
              rating: 5,
              date: "3 weeks ago",
              tripType: "Stayed with kids",
              comment:
                "We had a wonderful stay at Bao Uyen’s place. It’s a beautifully designed home with top-of-the-line quality throughout. Every detail was thoughtfully considered, from the layout to the amenities. The host was very accommodating and responsive. Highly recommend!",
            },
            {
              id: "4",
              userName: "Yuen Yung",
              userLocation: "9 years on Airbnb",
              rating: 5,
              date: "April 2025",
              comment:
                "Staying at Uyen’s place was extremely comfortable, very clear and easy instructions for check-in and check-out. The penthouse is spotless, amazing interior design. Uyen is also very friendly and helpful. Would love to come back!",
            },
            {
              id: "5",
              userName: "Park",
              userLocation: "12 years on Airbnb",
              rating: 5,
              date: "1 week ago",
              comment:
                "Everything was perfect. The location was nice and the apartment was new and clean. The host was very kind and she was always ready to support us. We had a great time and would recommend this place to anyone.",
            },
            {
              id: "6",
              userName: "Danielle",
              userLocation: "6 years on Airbnb",
              rating: 5,
              date: "May 2025",
              tripType: "Group trip",
              comment:
                "Great place to stay, everything is exactly as listed. Only thing is that there is only ac in the master bedroom and none in the rest only fans. Would definitely recommend the host was very helpful and responsive.",
            },
            {
              id: "7",
              userName: "Alex",
              userLocation: "London, UK",
              rating: 5,
              date: "2 months ago",
              comment:
                "Fantastic location and beautiful apartment. The check-in process was smooth and the host provided all the information we needed. Would stay again!",
            },
            {
              id: "8",
              userName: "Maria",
              userLocation: "Barcelona, Spain",
              rating: 5,
              date: "March 2025",
              comment:
                "The apartment exceeded our expectations. It was clean, modern, and had everything we needed for a comfortable stay. The host was very welcoming and gave us great tips for exploring the city.",
            },
          ]}
        />
      </div>

      {/* Divider */}
      <div className="w-2/3 h-px bg-gray-300 opacity-50 my-10 mx-auto"></div>

      {/* Map */}
      <div className="px-60 py-0">
        {property.latitude != null && property.longitude != null && !isNaN(property.latitude) && !isNaN(property.longitude) ? (
          <MapDisplay
            latitude={property.latitude}
            longitude={property.longitude}
            address={property.address}
          />
        ) : coordsLoading ? (
          <div>Loading map…</div>
        ) : coords && typeof coords.latitude === "number" && typeof coords.longitude === "number" ? (
          <MapDisplay
            latitude={coords.latitude}
            longitude={coords.longitude}
            address={property.address}
          />
        ) : (
          <div>Không tìm thấy vị trí trên bản đồ.</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
