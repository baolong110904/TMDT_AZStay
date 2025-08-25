"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  // Base listings for resolvedLocation
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [resolvedLocation, setResolvedLocation] = useState<string>(city);
  const [error, setError] = useState<string | null>(null);
  // Additional sections per location (fixed cities only)
  const [sectionListings, setSectionListings] = useState<Record<string, Listing[]>>({});
  const fixedCities = useMemo(() => ["Ha Noi", "Can Tho", "Vung Tau", "Da Nang"], []);
  const router = useRouter();
  const headerPhrases = useMemo(
    () => [
      "Popular homes in",
      "Available rentals in",
      "Places to stay in",
      "Check out homes in",
      "Homes in",
    ],
    []
  );

  // Track which fixed cities have been fetched to avoid abort loops
  const fetchedCitiesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/properties", {
          params: {
            city,
            checkin,
            checkout,
            guests,
          },
        });

        const { items } = res.data;
        console.log("API items:", items);

        const mapped: Listing[] = items.map((p: any, index: number) => {
          console.log(`Item ${index} first image:`, p.propertyimage?.[0]?.image_url);

          return {
            title: p.title,
            price: p.min_price ? p.min_price.toString() : "N/A",
            image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
            url: `/room/${p.property_id ?? ""}`, // sửa thành /room/
            rating: p.rating?.toString() || undefined,
            reviewsCount: p.reviewsCount?.toString() || undefined,
            locationHint: p.province || p.country || city,
          };
        });

        console.log("Mapped listings:", mapped);

        setListings(mapped);
        // also store into section listing for the resolved location (temp as current city for now)
        setSectionListings((prev) => ({ ...prev, [city]: mapped }));

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
        if (mostFrequentLocation) {
          setResolvedLocation(mostFrequentLocation);
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

  useEffect(() => {
    if (!resolvedLocation) return;
    setSectionListings((prev) => ({ ...prev, [resolvedLocation]: listings }));
  }, [resolvedLocation, listings]);

  // Fetch listings for each city in parallel
  useEffect(() => {
    // reset fetched cache when core inputs change
    fetchedCitiesRef.current.clear();

    const targets = fixedCities.filter((c) => c.toLowerCase() !== (resolvedLocation || "").toLowerCase());
    if (targets.length === 0) return;

    const controller = new AbortController();
    const run = async () => {
      await Promise.all(
        targets.map(async (c) => {
          if (fetchedCitiesRef.current.has(c)) return;
          try {
            const res = await api.get("/properties", {
              params: { city: c, checkin, checkout, guests },
              signal: controller.signal as any,
            });
            const mapped: Listing[] = (res.data?.items || []).map((p: any) => ({
              title: p.title,
              price: p.min_price ? p.min_price.toString() : "N/A",
              image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
              url: `/room/${p.property_id ?? ""}`,
              rating: p.rating?.toString() || undefined,
              reviewsCount: p.reviewsCount?.toString() || undefined,
              locationHint: p.province || p.country || c,
            }));
            setSectionListings((prev) => ({ ...prev, [c]: mapped }));
            fetchedCitiesRef.current.add(c);
          } catch (e) {
            console.warn(`Failed to load listings for ${c}:`, e);
            setSectionListings((prev) => ({ ...prev, [c]: [] }));
          }
        })
      );
    };
    run();
    return () => controller.abort();
  }, [fixedCities, resolvedLocation, checkin, checkout, guests]);

  const toggleFavorite = (key: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const displayedListings = listings.slice(0, 7);

  if (loading)
    return (
      <p className="text-center my-8 text-gray-700 flex items-center justify-center gap-1" aria-live="polite"> 
        <span className="ml-1 inline-flex">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0ms] mx-0.5"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:150ms] mx-0.5"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:300ms] mx-0.5"></span>
        </span>
      </p>
    );
  if (error) return <p className="text-center text-red-500 my-8">{error}</p>;

  return (
    <div className="py-4 px-4">
      <Section
        header={`${headerPhrases[0]} ${resolvedLocation} ›`}
        onHeaderClick={() =>
          router.push(`/search/${encodeURIComponent(resolvedLocation)}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`)
        }
        items={displayedListings}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onCardClick={(url) => router.push(url || "/")}
      />

      {/* Other city sections */}
      {fixedCities
        .filter((loc) => loc.toLowerCase() !== (resolvedLocation || "").toLowerCase())
        .map((loc, i) => (
        <Section
          key={`fixed-${loc}`}
          header={`${headerPhrases[(i + 1) % headerPhrases.length]} ${loc} ›`}
          onHeaderClick={() =>
            router.push(`/search/${encodeURIComponent(loc)}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`)
          }
          items={(sectionListings[loc] || []).slice(0, 7)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCardClick={(url) => router.push(url || "/")}
        />
      ))}
    </div>
  );
}

// Section component: header + horizontal scroller of cards
function Section({
  header,
  onHeaderClick,
  items,
  favorites,
  onToggleFavorite,
  onCardClick,
}: {
  header: string;
  onHeaderClick: () => void;
  items: Listing[];
  favorites: Set<string>;
  onToggleFavorite: (key: string) => void;
  onCardClick: (url?: string) => void;
}) {
  return (
    <div className="py-6">
      <div className="mx-auto flex items-baseline justify-between">
        <button
          onClick={onHeaderClick}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-left transform transition-transform duration-150 hover:scale-105"
        >
          {header}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3 justify-items-center">
        {items.map((item, idx) => {
          const favKey = item.url || `${item.title}|${item.image}|${idx}`;
          return (
          <div
            key={`${item.url}-${idx}`}
            className="w-full cursor-pointer"
            onClick={() => onCardClick(item.url || undefined)}
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
                    onToggleFavorite(favKey);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 hover:scale-105 transition"
                >
                  <Heart
                    size={22}
                    className={clsx("transition", {
                      "text-red-500 fill-red-500": favorites.has(favKey),
                      "text-gray-400": !favorites.has(favKey),
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
                      <>⭐ {item.rating} · {item.reviewsCount} reviews</>
                    ) : (
                      <span className="text-gray-400">No reviews</span>
                    )}
                  </p>
                  <p className="text-base font-semibold text-red-600 mb-2">
                    {item.price && item.price !== "N/A"
                      ? `${Number(item.price).toLocaleString("vi-VN")} đ / night`
                      : "No price"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-gray-500 px-2">No listings found.</div>
        )}
      </div>
    </div>
  );
}
