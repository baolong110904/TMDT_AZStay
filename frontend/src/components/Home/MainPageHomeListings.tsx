"use client";

import { useState, useEffect } from "react";
// import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { Listing } from "../type/MainPageListingProps";

const mockListings: Listing[] = [
  {
    title: "Cozy Apartment in Downtown",
    price: "75",
    image: "https://fastly.picsum.photos/id/0/5000/3333.jpg?hmac=_j6ghY5fCfSD6tvtcV74zXivkJSPIfR9B8w34XeQmvU",
    url: "https://www.airbnb.com/rooms/123",
    rating: "4.8",
    reviewsCount: "120",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Modern Loft with City View",
    price: "95",
    image: "https://fastly.picsum.photos/id/1/5000/3333.jpg?hmac=Asv2DU3rA_5D1xSe22xZK47WEAN0wjWeFOhzd13ujW4",
    url: "https://www.airbnb.com/rooms/124",
    rating: "4.9",
    reviewsCount: "85",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Charming Studio near Market",
    price: "60",
    image: "https://fastly.picsum.photos/id/10/2500/1667.jpg?hmac=J04WWC_ebchx3WwzbM-Z4_KC_LeLBWr5LZMaAkWkF68",
    url: "https://www.airbnb.com/rooms/125",
    rating: "4.7",
    reviewsCount: "95",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Luxury Condo with Pool",
    price: "120",
    image: "https://fastly.picsum.photos/id/16/2500/1667.jpg?hmac=uAkZwYc5phCRNFTrV_prJ_0rP0EdwJaZ4ctje2bY7aE",
    url: "https://www.airbnb.com/rooms/126",
    rating: "4.95",
    reviewsCount: "150",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Traditional Vietnamese House",
    price: "80",
    image: "https://fastly.picsum.photos/id/17/2500/1667.jpg?hmac=HD-JrnNUZjFiP2UZQvWcKrgLoC_pc_ouUSWv8kHsJJY",
    url: "https://www.airbnb.com/rooms/127",
    rating: "4.6",
    reviewsCount: "70",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Traditional Vietnamese House",
    price: "80",
    image: "https://fastly.picsum.photos/id/17/2500/1667.jpg?hmac=HD-JrnNUZjFiP2UZQvWcKrgLoC_pc_ouUSWv8kHsJJY",
    url: "https://www.airbnb.com/rooms/127",
    rating: "4.6",
    reviewsCount: "70",
    locationHint: "Ho Chi Minh City",
  },
  {
    title: "Traditional Vietnamese House",
    price: "80",
    image: "https://fastly.picsum.photos/id/17/2500/1667.jpg?hmac=HD-JrnNUZjFiP2UZQvWcKrgLoC_pc_ouUSWv8kHsJJY",
    url: "https://www.airbnb.com/rooms/127",
    rating: "4.6",
    reviewsCount: "70",
    locationHint: "Ho Chi Minh City",
  },
];

interface Props {
  city: string;
  checkin: string;
  checkout: string;
  guests: number;
  latitude: number;
  longitude: number;
}

export default function Listings({
  city,
  checkin,
  checkout,
  guests,
  latitude,
  longitude,
}: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [resolvedLocation, setResolvedLocation] = useState<string>(city);
  const [error, setError] = useState<string | null>(null);

  // fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setListings(mockListings);

        const locationCounts: Record<string, number> = {};
        mockListings.forEach((listing) => {
          const hint = listing.locationHint?.trim();
          if (hint) {
            locationCounts[hint] = (locationCounts[hint] || 0) + 1;
          }
        });

        const mostFrequentLocation = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])
          .at(0)?.[0];

        if (mostFrequentLocation) {
          setResolvedLocation(mostFrequentLocation);
        }
      } catch (err) {
        console.error("Error processing listings:", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [city, checkin, checkout, guests, latitude, longitude]);

  // favorite toggles (goi api o day nhe Long)
  const toggleFavorite = (idx: number) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  if (loading) return <p className="text-center my-8">Loading listings...</p>;
  if (error) return <p className="text-center text-red-500 my-8">{error}</p>;

  return (
    <div className="py-4 px-4">
      <div className="mx-auto">
        <h2 className="text-4xl font-bold mb-4">
          Available Rentals in {resolvedLocation}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3 justify-items-center">
        {listings.map((item, idx) => (
          <div key={idx} className="w-full">
            <div className="rounded-2xl h-[400px] hover:shadow-md hover:scale-105 transition bg-white">
              <div className="relative h-[60%]">
                <Image
                  src={item.image ?? ""}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover rounded-2xl"
                />

                {/* ❤️ Favorite button */}
                <button
                  onClick={() => toggleFavorite(idx)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 hover:scale-105 transition"
                >
                  <Heart
                    size={22}
                    className={clsx("transition", {
                      "text-red-500 fill-red-500": favorites.has(idx),
                      "text-gray-400": !favorites.has(idx),
                    })}
                  />
                </button>
                
              </div>
              
              <div className="p-4 h-[40%] flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1 truncate text-wrap">
                    {item.title ?? "Untitled Listing"}
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">
                    {item.rating && item.reviewsCount ? (
                      <>⭐ {item.rating} · {item.reviewsCount} reviewsCount</>
                    ) : (
                      <span className="text-gray-400">No reviewsCount</span>
                    )}
                  </p>
                  <p className="text-base font-semibold text-red-600 mb-2">
                    {item.price ? `$${item.price} / night` : "No price"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
