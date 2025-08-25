"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHomeListings from "@/components/Search/SearchPageHomeListing";
import SearchMap, { MapPoint } from "@/components/Search/SearchMap";
import FilterPanel, { SortKey } from "@/components/Search/FilterPanel";
import { SlidersHorizontal } from "lucide-react";
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [sortKey, setSortKey] = useState<SortKey>("price-asc");
  const [filterOpen, setFilterOpen] = useState(false);

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
            property_id: p.property_id,
            title: p.title,
            price: p.min_price ? p.min_price.toString() : "N/A",
            image: p.propertyimage?.[0]?.image_url || "/placeholder.jpg",
            url: `/room/${p.property_id}`,
            rating: p.rating?.toString() || undefined,
            reviewsCount: p.reviewsCount?.toString() || undefined,
            locationHint: p.province || p.country || city,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
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

  const numericPrices = useMemo(
    () =>
      listings
        .map((l) => (l.price === "N/A" ? NaN : Number(l.price)))
        .filter((v) => Number.isFinite(v)) as number[],
    [listings]
  );

  const domainMin = useMemo(() => (numericPrices.length ? Math.floor(Math.min(...numericPrices)) : 0), [numericPrices]);
  const domainMax = useMemo(() => (numericPrices.length ? Math.ceil(Math.max(...numericPrices)) : 10_000_000), [numericPrices]);

  // Initialize or update priceRange when listings change
  useEffect(() => {
    setPriceRange([domainMin, domainMax]);
  }, [domainMin, domainMax]);

  const filteredListings = useMemo(() => {
    const within = listings.filter((listing) => {
      const p = listing.price === "N/A" ? NaN : Number(listing.price);
      return Number.isFinite(p) && p >= priceRange[0] && p <= priceRange[1];
    });
    return within.sort((a, b) => {
      const pa = a.price === "N/A" ? NaN : Number(a.price);
      const pb = b.price === "N/A" ? NaN : Number(b.price);
      const ra = a.rating ? Number(a.rating) : 0;
      const rb = b.rating ? Number(b.rating) : 0;
      switch (sortKey) {
        case "price-desc":
          return (isNaN(pb) ? -Infinity : pb) - (isNaN(pa) ? -Infinity : pa);
        case "rating-desc":
          return rb - ra;
        case "rating-asc":
          return ra - rb;
        case "price-asc":
        default:
          return (isNaN(pa) ? Infinity : pa) - (isNaN(pb) ? Infinity : pb);
      }
    });
  }, [listings, priceRange, sortKey]);

  const step = useMemo(() => {
    const span = Math.max(1, domainMax - domainMin);
    // dynamic step ~1/100th of range, rounded to nearest 1,000
    const raw = Math.ceil(span / 100);
    const rounded = Math.max(1000, Math.round(raw / 1000) * 1000);
    return rounded;
  }, [domainMin, domainMax]);

  const minPercent = useMemo(
    () => (domainMax === domainMin ? 0 : ((priceRange[0] - domainMin) / (domainMax - domainMin)) * 100),
    [priceRange, domainMin, domainMax]
  );
  const maxPercent = useMemo(
    () => (domainMax === domainMin ? 100 : ((priceRange[1] - domainMin) / (domainMax - domainMin)) * 100),
    [priceRange, domainMin, domainMax]
  );

  const updateMin = (v: number) => setPriceRange(([_, hi]) => [Math.min(v, hi - step), hi]);
  const updateMax = (v: number) => setPriceRange(([lo, _]) => [lo, Math.max(v, lo + step)]);

  const resetFilters = () => {
    setPriceRange([domainMin, domainMax]);
    setSortKey("price-asc");
  };

  const points: MapPoint[] = useMemo(() => {
    return (filteredListings || [])
      .map((l) => {
        const price = l.price === "N/A" ? NaN : Number(l.price);
        const lat = (l as any).latitude ?? (l as any).lat ?? null;
        const lng = (l as any).longitude ?? (l as any).lng ?? null;
        if (!isFinite(price) || lat == null || lng == null) return null;
  return { lat: Number(lat), lng: Number(lng), price, title: l.title, url: l.url, image: l.image ?? null } as MapPoint;
      })
      .filter(Boolean) as MapPoint[];
  }, [filteredListings]);

  return (
    <div className="w-full">
      <Header />

      <div className="max-w-screen-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold">
            Search results in {decodeURIComponent(city)}
          </h1>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 mx-8 rounded-full px-4 py-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
        </div>
        <p className="mb-4 text-gray-500">
          Checkin: {checkin || "N/A"} | Checkout: {checkout || "N/A"} | Guests:{" "}
          {guests || "N/A"}
        </p>

  {/* Filter trigger moved to header row */}

        {loading ? (
          <div className="flex flex-col items-center my-10 gap-3 text-blue-600">
            <div className="flex items-end gap-1 h-6">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 my-8">{error}</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-center">No listings found</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="min-h-[60vh]">
              <SearchHomeListings 
                list={filteredListings}
                user_id={null}
                token={null} 
              />
            </div>
            <div className="mt-5 sticky top-20 h-[85vh] hidden lg:block">
              <SearchMap points={points} />
            </div>
          </div>
        )}
        {/* Overlay Filter Panel */}
        {filterOpen && (
          <FilterPanel
            domainMin={domainMin}
            domainMax={domainMax}
            priceRange={priceRange}
            step={step}
            sortKey={sortKey}
            onPriceMinChange={updateMin}
            onPriceMaxChange={updateMax}
            onSortChange={setSortKey}
            onReset={resetFilters}
            onClose={() => setFilterOpen(false)}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
