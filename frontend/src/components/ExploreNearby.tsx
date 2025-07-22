"use client";

import { useState, useEffect } from "react";
import iconList from "@/assets/iconList"; 
import { calculateDistance } from "@/utils/distance";
import type { StaticImageData } from "next/image"; 

interface ExploreNearbyProps {
  latitude: number;
  longitude: number;
}

interface GeoCity {
  name: string;
  lat: number;
  lng: number;
}

interface Destination {
  name: string;
  distance: string;
  icon: StaticImageData; 
}

export default function ExploreNearby({ latitude, longitude }: ExploreNearbyProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [city, setCity] = useState<string>("Ho Chi Minh City");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Placeholder for API call - will replace with fetch logic 
    const fetchNearby = () => {
      try {
        setLoading(true);
        setError(null);

        // Mock latitude and longitude
        const lat = latitude || 10.7769;
        const lng = longitude || 106.7009;

        // Mock data - replace with API response later
        const mockNearby: GeoCity[] = [
          { name: "Da Nang", lat: 16.0544, lng: 108.2022 },
          { name: "Hanoi", lat: 21.0278, lng: 105.8342 },
          { name: "Nha Trang", lat: 12.2387, lng: 109.1943 },
          { name: "Can Tho", lat: 10.0451, lng: 105.7478 },
          { name: "Da Lat", lat: 11.9413, lng: 108.4451 },
          { name: "Phu Quoc", lat: 10.2226, lng: 103.9670 },
          { name: "Hue", lat: 16.4637, lng: 107.5906 },
          { name: "Vung Tau", lat: 10.3460, lng: 107.0842 },
        ];

        // Process mock data with iconList
        const nearby: Destination[] = mockNearby
          .map((city: GeoCity, index: number): Destination => ({
            name: city.name,
            distance: `${Math.round(calculateDistance(lat, lng, city.lat, city.lng))} km`,
            icon: iconList[index % iconList.length] || iconList[0], // Cycle through iconList
          }))
          .sort((a: Destination, b: Destination) =>
            parseInt(a.distance) - parseInt(b.distance)
          )
          .slice(0, 8);

        setCity("Ho Chi Minh City"); // Mock city name
        setDestinations(nearby);
      } catch (err: any) {
        console.error("Nearby fetch error:", err);
        setError("Failed to load nearby destinations");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [latitude, longitude]);

  if (loading) return <p className="text-center">Loading nearby destinations…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="max-w-7xl mx-auto my-8">
      <h2 className="text-4xl font-semibold mb-6">Explore Nearby in {city}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {destinations.map((dest: Destination, index: number) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
          >
            <img
              src={dest.icon.src}
              alt={`Icon for ${dest.name}`}
              className="w-16 h-16 object-cover rounded-full"
              width={64}
              height={64}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{dest.name}</h3>
              <p className="text-sm text-gray-600">{dest.distance}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}