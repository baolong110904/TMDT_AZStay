"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number | { "$numberLong": string }; // Handle MongoDB numberLong
  currency: string;
  link: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkInDate?: Date; // Updated to Date only after normalization
  checkOutDate?: Date; // Updated to Date only after normalization
  image?: { url: string };
  reviewStat?: { rating: number; count: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Experience {
  url: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  locationHint: string;
}

export default function SearchPage() {
  const params = useSearchParams();
  const rawLocation = params?.get("location") ?? "Madrid";
  const rawStart = params?.get("startDate") ?? "2025-07-18";
  const rawEnd = params?.get("endDate") ?? "2025-07-23";
  const guests = params?.get("guests") ?? "1";

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [homes, setHomes] = useState<Listing[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toLocalYMD = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Function to normalize MongoDB date and number formats
  const normalizeListing = (listing: any): Listing => {
    const normalizeDate = (date: Date | { $date: string } | undefined): Date | undefined => {
      if (!date) return undefined;
      if (date instanceof Date) return date;
      if ("$date" in date) return new Date(date["$date"]);
      return undefined; // Fallback for unexpected formats
    };

    return {
      id: listing._id?.["$oid"] || "",
      title: listing.title || "",
      description: listing.description || "",
      price:
        typeof listing.price === "object" && "$numberLong" in listing.price
          ? parseInt(listing.price["$numberLong"])
          : listing.price || 0,
      currency: listing.currency || "",
      link: listing.link || "",
      address: listing.address,
      latitude: listing.latitude,
      longitude: listing.longitude,
      checkInDate: normalizeDate(listing.checkInDate),
      checkOutDate: normalizeDate(listing.checkOutDate),
      image: listing.image,
      reviewStat: listing.reviewStat,
      isActive: listing.isActive || false,
      createdAt: normalizeDate(listing.createdAt) || new Date(),
      updatedAt: normalizeDate(listing.updatedAt) || new Date(),
    };
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      try {
        setError(null);
        const city = rawLocation.split(",")[0].trim().toLowerCase();
        const coords = {
          "madrid": { lat: 40.4168, lng: -3.7038 },
          "ho chi minh city": { lat: 10.7769, lng: 106.7009 },
          "da nang": { lat: 16.0544, lng: 108.2022 },
          "hanoi": { lat: 21.0278, lng: 105.8342 },
          "nha trang": { lat: 12.2387, lng: 109.1943 },
          "da lat": { lat: 11.9413, lng: 108.4451 },
        }[city];
        if (!coords) {
          console.warn(`Unknown city: ${city}, defaulting to Madrid`);
          setCoords({ lat: 40.4168, lng: -3.7038 });
        } else {
          setCoords(coords);
        }
      } catch (err) {
        console.error("Geocode error:", err);
        setError("Failed to resolve location");
        setCoords(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCoordinates();
  }, [rawLocation]);

  useEffect(() => {
    if (!coords || !rawStart || !rawEnd) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/azstay.Listing.json");
        if (!response.ok) throw new Error("Failed to fetch listings data");
        const rawData: any[] = await response.json();

        const normalizedData = rawData.map(normalizeListing);
        const filteredHomes = normalizedData.filter((listing: Listing) => {
          if (!coords) return false;
          const latMatch = listing.latitude !== undefined && Math.abs(listing.latitude - coords.lat) < 1;
          const lngMatch = listing.longitude !== undefined && Math.abs(listing.longitude - coords.lng) < 1;
          const dateMatch =
            (!listing.checkInDate || listing.checkInDate >= new Date(toLocalYMD(rawStart))) &&
            (!listing.checkOutDate || listing.checkOutDate <= new Date(toLocalYMD(rawEnd)));
          return latMatch && lngMatch && dateMatch;
        });

        setHomes(filteredHomes);
        setExperiences([]); // Placeholder until Experience model is added
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load homes and experiences. Check if azstay.Listing.json exists in public/data/");
        setHomes([]);
        setExperiences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coords, rawStart, rawEnd, guests, rawLocation]);

  const formatRange = () => {
    if (!rawStart || !rawEnd) return "Any week";
    const opts = { day: "2-digit", month: "short" } as const;
    const s = new Intl.DateTimeFormat("en-GB", opts).format(new Date(rawStart));
    const e = new Intl.DateTimeFormat("en-GB", opts).format(new Date(rawEnd));
    return `${s} - ${e}`;
  };
  const formatFull = () => {
    if (!rawStart || !rawEnd) return "";
    const opts = { day: "2-digit", month: "long", year: "numeric" } as const;
    const s = new Intl.DateTimeFormat("en-GB", opts).format(new Date(rawStart));
    const e = new Intl.DateTimeFormat("en-GB", opts).format(new Date(rawEnd));
    return `${s} - ${e}`;
  };

  return (
    <>
      <Header
        placeholder={`${rawLocation} | ${formatRange()} | ${guests} ${
          Number(guests) === 1 ? "guest" : "guests"
        }`}
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {rawStart && rawEnd && (
          <p className="text-gray-600 mb-4">
            {formatFull()} - {guests} {Number(guests) === 1 ? "guest" : "guests"}
          </p>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!coords && !error && <p>Resolving location…</p>}
        {coords && loading && <p className="text-gray-600">Loading homes & experiences…</p>}

        {coords && !loading && !error && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Stays in {rawLocation.split(",")[0]}</h1>

            <section>
              <h2 className="text-xl font-semibold mb-4">Homes</h2>
              {homes.length ? (
                homes.map((home) => {
                  const nights = Math.ceil(
                    (new Date(rawEnd).getTime() - new Date(rawStart).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const totalPrice = typeof home.price === "number" ? home.price * nights : null;
                  return (
                    <div key={home.id} className="flex py-4 border-b">
                      {home.image && (
                        <img
                          src={home.image.url}
                          alt={home.title ?? ""}
                          className="w-40 h-30 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div className="flex flex-col flex-grow">
                        <a href={home.link} target="_blank" rel="noopener noreferrer">
                          <h3 className="text-xl font-semibold">{home.title}</h3>
                        </a>
                        <p className="text-gray-600">{home.description}</p>
                        <div className="mt-auto">
                          <p className="text-lg font-bold">
                            {typeof home.price === "number" ? `${home.price} ${home.currency}/night` : "Price N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {totalPrice ? `${totalPrice} ${home.currency} for ${nights} nights` : ""}
                          </p>
                          <a href={home.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            View Listing
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>
                  No homes available in {rawLocation.split(",")[0]} for your dates. Try
                  adjusting your search.
                </p>
              )}
            </section>

            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Experiences</h2>
              {experiences.length ? (
                experiences.map((exp) => (
                  <div key={exp.url} className="flex py-4 border-b">
                    {exp.image && (
                      <img
                        src={exp.image}
                        alt={exp.title ?? ""}
                        className="w-40 h-30 object-cover rounded-lg mr-4"
                      />
                    )}
                    <div className="flex flex-col flex-grow">
                      <a href={exp.url} target="_blank" rel="noopener noreferrer">
                        <h3 className="text-xl font-semibold">{exp.title}</h3>
                      </a>
                      <p className="text-gray-600">{exp.locationHint}</p>
                      <div className="mt-auto">
                        <p className="text-lg font-bold">
                          {exp.price ? `$${exp.price}` : "Price N/A"}
                        </p>
                        {exp.rating && (
                          <p className="text-sm text-gray-600">
                            ⭐ {exp.rating} · {exp.reviews ?? "0"} reviews
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No experiences available in {rawLocation.split(",")[0]}.</p>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}