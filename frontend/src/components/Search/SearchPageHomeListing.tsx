"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Router } from "lucide-react";
import clsx from "clsx";
import { Listing } from "@/components/Props/MainPageListingProps";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

export default function SearchHomeListings({
  list,
  token,
  user_id,
}: {
  list: Listing[];
  token: string | null;
  user_id: string | null;
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  if (!token || !user_id) {
    const user_data = localStorage.getItem("user");
    token = localStorage.getItem("token");
    if (user_data && token) {
      const uid = JSON.parse(user_data);
      user_id = uid.user_id;
      console.log("HERE IS USER_ID:", user_id);
      console.log("HERE IS TOKEN:", token);
    }
  }
  // 🔹 Hàm fetch favorites
  const fetchFavoritesStatus = async () => {
    try {
      if (!user_id || !token || list.length === 0) return;
      const property_ids = list.map((m) => m.property_id);
      const res = await api.post(
        "/properties/get-fav-status",
        { user_id, property_id: property_ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const favList: string[] =
        res.data?.data?.map((f: any) => f.property_id) || [];
      setFavorites(new Set(favList));
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  useEffect(() => {
    fetchFavoritesStatus();
  }, [list, user_id, token]);

  // 🔹 Toggle favorites
  const toggleFavorite = async (
    property_id: string | null,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!property_id || !user_id || !token) {
      router.push("/login");
      return;
    }

    try {
      if (favorites.has(property_id)) {
        await api.post(
          "/properties/remove-fav",
          { user_id, property_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post(
          "/properties/add-fav",
          { user_id, property_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // ✅ Sau khi add/remove thì reload lại favorites
      fetchFavoritesStatus();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
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
          <Link key={idx} href={item.url || `${item.url}`} className="w-full">
            <div className="rounded-2xl h-[400px] hover:shadow-md hover:scale-101 transition bg-white cursor-pointer">
              <div className="relative h-[60%]">

                <Image
                  src={item.image ?? ""}
                  alt={item.title ?? ""}
                  fill
                  className="object-cover rounded-2xl"
                />
                <button
                  onClick={(e) => toggleFavorite(item.property_id, e)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 hover:scale-105 transition"
                >
                  <Heart
                    size={22}
                    className={clsx("cursor-pointer transition", {
                      "text-red-500 fill-red-500": favorites.has(
                        item.property_id ?? ""
                      ),
                      "text-gray-400": !favorites.has(item.property_id ?? ""),
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
