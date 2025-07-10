'use client';

import { useState, useEffect } from 'react';
import iconList from '@/assets/iconList';
import { calculateDistance } from '@/utils/distance';

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
  icon: any;
}

export default function ExploreNearby({ latitude, longitude }: ExploreNearbyProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [city, setCity] = useState<string>('Ho Chi Minh City');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearby() {
      try {
        const lat = latitude || 10.7769;
        const lng = longitude || 106.7009;

        const res = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        setCity(data.city || 'Unknown City');

        const nearby: Destination[] = (data.nearby || [])
          .map((city: GeoCity): Destination => ({
            name: city.name,
            distance: `${Math.round(calculateDistance(lat, lng, city.lat, city.lng))} km`,
            icon: null, // will be added in next step
          }))
          .sort((a: Destination, b: Destination) =>
            parseInt(a.distance) - parseInt(b.distance)
          )
          .slice(0, 8)
          .map((city: Destination, index: number): Destination => ({
            ...city,
            icon: iconList[index] || iconList[0],
          }));

        setDestinations(nearby);
      } catch (err: any) {
        console.error('Nearby fetch error:', err);
        setError(err.message || 'Failed to load nearby destinations');
      } finally {
        setLoading(false);
      }
    }

    fetchNearby();
  }, [latitude, longitude]);

  if (loading) return <p className="text-center">Loading nearby destinations…</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <section className="max-w-7xl mx-auto my-8">
      <h2 className="text-4xl font-semibold mb-4">
        Explore Nearby in {city}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {destinations.map((dest: Destination, index: number) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition duration-200 cursor-pointer"
          >
            <img
              src={dest.icon.src}
              alt={`Icon for ${dest.name}`}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{dest.name}</h3>
              <p className="text-sm text-gray-500">{dest.distance}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
