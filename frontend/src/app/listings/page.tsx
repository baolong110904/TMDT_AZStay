"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import { Listing } from "@/components/Type/MainPageListingProps";

export default function ListingsPage() {
  const searchParams = useSearchParams();
  if (!searchParams) return null;

  const city = searchParams.get("city") || "Ho Chi Minh City";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const guests = searchParams.get("guests") || "1";

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/properties", {
          params: { city, checkin, checkout, guests, page, limit: 10 },
        });

        const { items, totalPages } = res.data;

        // Map dữ liệu giống MainPageHomeListings
        const mapped: Listing[] = items.map((p: any) => ({
          title: p.title,
          price: p.min_price ? p.min_price.toString() : "N/A",
          image: p.propertyimage?.[0]?.url || "/placeholder.jpg",
          url: `/property/${p.property_id}`,
          rating: p.rating?.toString() || undefined,
          reviewsCount: p.reviewsCount?.toString() || undefined,
          locationHint: p.province || p.country || city,
        }));

        setListings(mapped);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Error loading listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, checkin, checkout, guests, page]);

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tất cả nhà tại {city}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {listings.map((item, idx) => (
          <div
            key={idx}
            className="border rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <Image
              src={item.image ?? ""}
              alt={item.title ?? ""}
              width={400}
              height={300}
              className="object-cover w-full h-60"
            />
            <div className="p-4">
              <h2 className="font-semibold truncate">{item.title}</h2>
              <p className="text-sm text-gray-700 mb-1">
                {item.rating && item.reviewsCount ? (
                  <>⭐ {item.rating} · {item.reviewsCount} reviews</>
                ) : (
                  <span className="text-gray-400">No reviews</span>
                )}
              </p>
              <p className="text-red-600 font-bold">
                {item.price && item.price !== "N/A"
                  ? `${Number(item.price).toLocaleString("vi-VN")} đ / night`
                  : "No price"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
