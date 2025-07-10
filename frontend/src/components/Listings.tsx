"use client";

import { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface Listing {
  title: string | null;
  price: string | null;
  image: string | null;
  url: string | null;
  rating: string | null;
  reviews: string | null;
  locationHint?: string | null;
}

interface Props {
  city: string;
  checkin: string;
  checkout: string;
  guests: number;
  latitude: number;
  longitude: number;
}

const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} focus:outline-none`}
      style={{
        ...style,
        display: "block",
        background: "none",
        right: "-40px",
        zIndex: 10,
        cursor: "pointer",
        position: "absolute",
        top: "40%",
        transform: "translateY(-50%)",
        padding: 0,
      }}
      onClick={onClick}
    >
      <ChevronRight size={40} color="#808080" style={{ opacity: 0.5 }} />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} focus:outline-none`}
      style={{
        ...style,
        display: "block",
        background: "none",
        left: "-60px",
        zIndex: 10,
        cursor: "pointer",
        position: "absolute",
        top: "40%",
        transform: "translateY(-50%)",
        padding: 0,
      }}
      onClick={onClick}
    >
      <ChevronLeft size={40} color="#808080" style={{ opacity: 0.5 }} />
    </button>
  );
};

export default function Listings({
  city,
  checkin,
  checkout,
  guests,
  latitude,
  longitude,
}: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<string>(city);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: latitude.toString(),
          lng: longitude.toString(),
          checkin,
          checkout,
          guests: guests.toString(),
        });

        const res = await fetch(`/api/scrape?${params.toString()}`);
        const data = await res.json();

        const uniqueListings = data.listings.filter(
          (listing: Listing, index: number, self: Listing[]) =>
            listing.url && index === self.findIndex((l) => l.url === listing.url)
        );

        setListings(uniqueListings || []);

        // Enhanced location resolution
        const locationCounts: Record<string, number> = {};

        uniqueListings.forEach((listing: Listing) => {
          let hint = listing.locationHint?.trim();

          if (!hint && listing.title) {
            const match = listing.title.match(/in\s+(.+)/i);
            if (match && match[1]) {
              hint = match[1].trim();
            }
          }

          if (hint) {
            locationCounts[hint] = (locationCounts[hint] || 0) + 1;
          }
        });

        const sortedLocations = Object.entries(locationCounts)
          .filter(([loc]) => loc.toLowerCase() !== "shanghai")
          .sort((a, b) => b[1] - a[1]);

        const mostFrequentLocation = sortedLocations?.[0]?.[0];
        setResolvedLocation(mostFrequentLocation || city);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setResolvedLocation(city);
      } finally {
        setLoading(false);
      }
    })();
  }, [city, checkin, checkout, guests, latitude, longitude, mounted]);

  if (!mounted) return null;
  if (loading) return <p className="text-center my-8">Loading listings...</p>;

  return (
   <div className="my-8 px-4">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold mb-4">
        Available Rentals in {resolvedLocation}
      </h2>
    </div>
      <style>{`
        .slick-track {
          display: flex !important;
        }
      `}</style>

      <Slider
        dots
        infinite
        speed={500}
        slidesToShow={4}
        slidesToScroll={1}
        nextArrow={<NextArrow />}
        prevArrow={<PrevArrow />}
        responsive={[
          { breakpoint: 1280, settings: { slidesToShow: 3 } },
          { breakpoint: 1024, settings: { slidesToShow: 2 } },
          { breakpoint: 768, settings: { slidesToShow: 1 } },
        ]}
      >
        {listings.map((item, idx) => (
          <div key={idx} className="p-2 h-full">
            <div className="border rounded-lg overflow-hidden shadow-md h-full flex flex-col">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title ?? ""}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col justify-between h-48">
                <div>
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {item.title ?? "Untitled Listing"}
                  </h3>
                  <p className="text-sm text-gray-700 mb-1">
                    {item.rating && item.reviews ? (
                      <>⭐ {item.rating} · {item.reviews} reviews</>
                    ) : (
                      <span className="text-gray-400">No reviews</span>
                    )}
                  </p>
                  <p className="text-base font-semibold text-red-600 mb-2">
                    {item.price ? `$${item.price} / night` : <span className="text-gray-400">No price</span>}
                  </p>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:underline mt-auto"
                  >
                    View on Airbnb
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

      </Slider>
    </div>
  );
}
