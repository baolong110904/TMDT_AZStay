"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import SearchHomeListings from "@/components/Search/SearchPageHomeListing";
import { Listing } from "@/components/Props/MainPageListingProps";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function RecommendedPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Load user + token from localStorage
  useEffect(() => {
    try {
      const storedUserRaw = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!storedUserRaw || !token) {
        router.push("/login");
        return;
      }
      const storedUser = JSON.parse(storedUserRaw);
      const uid =
        storedUser?.id ??
        storedUser?.user_id ??
        storedUser?.user?.id ??
        storedUser?.user?.user_id ??
        null;

      if (typeof uid === "string" && uid.length > 0) {
        setToken(token);
        setUserId(uid);
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error("Failed to parse user/token:", e);
      router.push("/login");
    }
  }, [router]);

  // Fetch recommended properties
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        // Note: your backend expects user_id as route param
        const res = await api.post(
          `/properties/get-recommended/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("API raw response:", res.data);

        const items =
          res.data?.data && Array.isArray(res.data.data)
            ? res.data.data
            : [];

        const mapped: Listing[] = items.map((p: any) => ({
          property_id: p.property_id ?? null,
          title: p.title ?? null,
          price: p.min_price ? String(p.min_price) : "N/A",
          image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
          url: p.property_id ? `/room/${p.property_id}` : null,
          rating: p.rating != null ? String(p.rating) : null,
          reviewsCount: p.reviewsCount != null ? String(p.reviewsCount) : null,
          locationHint: p.province || p.country || p.address || null,
        }));

        setRecommendations(mapped);
      } catch (err: any) {
        console.error("Error fetching recommendations:", err);

        if (err.response?.status === 404) {
          setRecommendations([]);
        } else {
          setError("Failed to load recommended properties");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, token]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto my-8 px-4">
        <h1 className="text-4xl font-bold mb-4">Recommended for You</h1>

        {loading ? (
          <p className="text-center my-8">Loading recommendations...</p>
        ) : error ? (
          <p className="text-center text-red-500 my-8">{error}</p>
        ) : recommendations.length === 0 ? (
          <p className="text-center">No recommendations found</p>
        ) : (
          <SearchHomeListings
            list={recommendations}
            token={token}
            user_id={userId}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
