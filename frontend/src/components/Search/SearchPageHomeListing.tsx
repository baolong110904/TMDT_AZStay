"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // ✅ Thêm import Link
import { Heart } from "lucide-react";
import clsx from "clsx";
import { Listing } from "@/components/Props/MainPageListingProps";

const PAGE_SIZE = 20;

export default function SearchHomeListings({ list }: { list: Listing[] }) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const toggleFavorite = (idx: number, e: React.MouseEvent) => {
    e.preventDefault(); // ✅ Ngăn click vào link
    e.stopPropagation();
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paginatedList = list.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      scrollToTop();
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Total Results: {list.length}
        </h2>
      </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
        {paginatedList.map((item, idx) => (
          <Link
            key={idx}
            href={item.url || `${item.url}`} // ✅ Link sang trang Room
            className="w-full"
          >
    <div className="rounded-2xl h-[360px] hover:shadow-md hover:scale-[1.01] transition bg-white cursor-pointer">
      <div className="relative h-[55%]">
                <Image
                  src={item.image ?? ""}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover rounded-2xl"
                />
                <button
                  onClick={(e) => toggleFavorite(idx, e)}
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
          </Link>
        ))}
      </div>

      <div className="mt-9 flex justify-center gap-3 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 hover:shadow-md hover:scale-105 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:shadow-md hover:scale-105 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
