"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHomeListings from "@/components/Search/SearchPageHomeListing";
import api from "@/lib/axios";
import { Listing } from "@/components/Props/MainPageListingProps";

export default function SearchPage() {
  const params = useParams();
  const rawCity = (params?.city as string) || "";
  const city = decodeURIComponent(rawCity);

  const searchParams = useSearchParams();
  const checkin = searchParams?.get("checkin") || "";
  const checkout = searchParams?.get("checkout") || "";
  const guests = searchParams?.get("guests") || "";

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999999]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

        const mapped: Listing[] = items.map((p: any, index: number) => {
          return {
            title: p.title,
            price: p.min_price ? p.min_price.toString() : "N/A",
            image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
            url: `/room/${p.property_id}`,
            rating: p.rating?.toString() || undefined,
            reviewsCount: p.reviewsCount?.toString() || undefined,
            locationHint: p.province || p.country || city,
          };
        });

        setListings(mapped);
      } catch (err) {
        console.error("Error loading properties:", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchListings();
  }, [city, checkin, checkout, guests]);

  const filteredListings = listings
    .filter(
      (listing) =>
        listing.price !== "N/A" &&
        Number(listing.price) >= priceRange[0] &&
        Number(listing.price) <= priceRange[1]
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? Number(a.price) - Number(b.price)
        : Number(b.price) - Number(a.price)
    );

  return (
    <div className="w-full">
      <Header />

      <div className="max-w-screen-3xl mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold mb-4">
          Search results in {decodeURIComponent(city)}
        </h1>
        <p className="mb-4 text-gray-500">
          Checkin: {checkin || "N/A"} | Checkout: {checkout || "N/A"} | Guests:{" "}
          {guests || "N/A"}
        </p>

        {/* Filter UI */}
        <div className="flex justify-center flex-wrap items-center gap-4 px-4 py-4">
          <label className="flex items-center gap-2">
            Min Price:
            <input
              type="number"
              className="border px-2 py-1 rounded w-24"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
            />
          </label>

          <label className="flex items-center gap-2">
            Max Price:
            <input
              type="number"
              className="border px-2 py-1 rounded w-24"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
            />
          </label>

          <label className="flex items-center gap-2">
            Sort:
            <select
              className="border px-2 py-1 rounded h-9"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "asc" | "desc")
              }
            >
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-center my-8">Loading listings...</p>
        ) : error ? (
          <p className="text-center text-red-500 my-8">{error}</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-center">No listings found</p>
        ) : (
          <SearchHomeListings list={filteredListings} />
        )}
      </div>

      <Footer />
    </div>
  );
}
