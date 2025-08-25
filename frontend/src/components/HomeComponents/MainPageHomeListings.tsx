"use client";

import { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { Listing } from "../Props/MainPageListingProps";
import api from "@/lib/axios";

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
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // use property_id instead of idx
  const [loading, setLoading] = useState(true);
  const [resolvedLocation, setResolvedLocation] = useState<string>(city);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/properties", {
          params: { city, checkin, checkout, guests },
        });

        const { items } = res.data;

        const mapped: Listing[] = items.map((p: any) => ({
          property_id: p.property_id,
          title: p.title,
          price: p.min_price ? p.min_price.toString() : "N/A",
          image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
          url: `/room/${p.property_id ?? ""}`,
          rating: p.rating?.toString() || undefined,
          reviewsCount: p.reviewsCount?.toString() || undefined,
          locationHint: p.province || p.country || city,
        }));

        setListings(mapped);

        // pick most frequent location
        const locationCounts: Record<string, number> = {};
        mapped.forEach((listing) => {
          const hint = listing.locationHint?.trim();
          if (hint) {
            locationCounts[hint] = (locationCounts[hint] || 0) + 1;
          }
        });
        const mostFrequentLocation = Object.entries(locationCounts)
          .sort((a, b) => b[1] - a[1])
          .at(0)?.[0];
        if (mostFrequentLocation) setResolvedLocation(mostFrequentLocation);

        // now fetch favorites if logged in
        const token = localStorage.getItem("token");
        const user_data = localStorage.getItem("user");

        if (token && user_data && mapped.length > 0) {
          const user_id = JSON.parse(user_data).user_id;

          // collect property_ids from the mapped listings
          const propertyIds = mapped.map((p) => p.property_id);

          const favRes = await api.post(
            "/properties/get-fav-status",
            { user_id, property_id: propertyIds }, // <-- always send array
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // backend returns favorites (array of userfavorite)
          const favList: string[] =
            favRes.data.data?.map((f: any) => f.property_id) || [];

          setFavorites(new Set(favList));
        }
      } catch (err) {
        console.error("Error loading properties:", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [city, checkin, checkout, guests, latitude, longitude]);

  const toggleFavorite = async (property_id: string) => {
    const token = localStorage.getItem("token");
    const user_data = localStorage.getItem("user");

    if (!token || !user_data) {
      router.push("/login");
      return;
    }

    const user_id = JSON.parse(user_data).user_id;

    try {
      if (favorites.has(property_id)) {
        // remove favorite
        await api.post(
          "/properties/remove-fav",
          { user_id, property_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(property_id);
          return newSet;
        });
      } else {
        // add favorite
        await api.post(
          "/properties/add-fav",
          { user_id, property_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites((prev) => new Set(prev).add(property_id));
      }
    } catch (err) {
      console.error("❌ Failed to toggle favorite:", err);
    }
  };

  const displayedListings = listings.slice(0, 7);

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
        {displayedListings.map((item) => (
          <div
            key={item.property_id}
            className="w-full cursor-pointer"
            onClick={() => router.push(item.url || "/")}
          >
            <div className="rounded-2xl h-[400px] hover:shadow-md hover:scale-105 transition bg-white">
              <div className="relative h-[60%]">
                <Image
                  src={item.image ?? ""}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover rounded-2xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.property_id!);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 hover:scale-105 transition"
                >
                  <Heart
                    size={22}
                    className={clsx("transition", {
                      "text-red-500 fill-red-500": favorites.has(
                        item.property_id!
                      ),
                      "text-gray-400": !favorites.has(item.property_id!),
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
                      <>
                        ⭐ {item.rating} · {item.reviewsCount} reviews
                      </>
                    ) : (
                      <span className="text-gray-400">No reviews</span>
                    )}
                  </p>
                  <p className="text-base font-semibold text-red-600 mb-2">
                    {item.price && item.price !== "N/A"
                      ? `${Number(item.price).toLocaleString(
                          "vi-VN"
                        )} đ / night`
                      : "No price"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {listings.length > 7 && (
        <div className="text-center mt-6">
          <button
            onClick={() =>
              router.push(
                `/search/${encodeURIComponent(
                  resolvedLocation
                )}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`
              )
            }
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Show all
          </button>
        </div>
      )}
    </div>
  );
}
