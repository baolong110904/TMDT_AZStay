"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHomeListings from "@/components/Search/SearchPageHomeListing";
import { mockListings } from "@/components/Search/mockListing"; // dữ liệu giả

export default function SearchPage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999999]); // Min - Max Price
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Giá tăng hoặc giảm
  
  const filterAndSortListings = () => {
    return mockListings
      .filter(
        (listing) =>
          listing.price >= priceRange[0] && listing.price <= priceRange[1]
      )
      .sort((a, b) =>
        sortOrder === "asc" ? a.price - b.price : b.price - a.price
      );
  };

  const filteredListings = filterAndSortListings();
  
  return (
    <div className="w-full">
      <Header />

      <div className="max-w-screen-3xl mx-auto px-4 py-4">
        {/* Filter UI */}
        <div className=" flex justify-center flex-wrap items-center gap-4 px-4 py-4">
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

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <p className="text-center">No listings found</p>
        ) : (
          <SearchHomeListings list={filteredListings} />
        )}
      </div>

      <Footer />
    </div>
  );
}
