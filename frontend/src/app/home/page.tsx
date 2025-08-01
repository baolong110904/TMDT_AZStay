"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import ExploreNearby from '@/components/ExploreNearby';
import Listings from '@/components/Listings';
import MediumCard from '@/components/home/MediumCard';
import LargeCard from '@/components/home/LargeCard';
import Footer from '@/components/Footer';

export default function Home() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [loadingCity, setLoadingCity] = useState(true);

  const checkin = '2025-07-15';
  const checkout = '2025-07-20';
  const guests = 2;

  useEffect(() => {
    async function determineLocation() {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        );
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // dùng API để lấy tên thành phố, dùng đoạn bên dưới thay vì setCity tĩnh
        // const response = await fetch(`http://localhost:4000/listings?lat=${latitude}&lng=${longitude}&checkin=${checkin}&checkout=${checkout}`);
        // if (!response.ok) throw new Error(`GeoNames error: ${response.status}`);
        // const data = await response.json();
        // setCity(data.geonames?.[0]?.name || 'Ho Chi Minh City');

        setCity('Ho Chi Minh City'); // hoặc giữ mặc định này nếu không dùng API
      } catch (error) {
        console.error('Location error:', error);
        setCoords({ latitude: 10.7769, longitude: 106.7009 }); // fallback HCM
        setCity('Ho Chi Minh City');
      } finally {
        setLoadingCity(false);
      }
    }
    determineLocation();
  }, []);

  return (
    <div>
      <Header />
      <Banner />

      {/* Loading nearby locations */}
      <section className="max-w-7xl mx-auto my-8">
        {coords ? (
          <ExploreNearby latitude={coords.latitude} longitude={coords.longitude} />
        ) : (
          <p className="text-center">Loading nearby locations…</p>
        )}
      </section>

      {/* listing location for customer */}
      <section className="max-w-7xl mx-auto my-8">
        {loadingCity || !city || !coords ? (
          <p className="text-center">Determining your city…</p>
        ) : (
          <Listings
            city={city}
            checkin={checkin}
            checkout={checkout}
            guests={guests}
            latitude={coords.latitude}
            longitude={coords.longitude}
          />
        )}
      </section>

      {/* medium card */}
      <section className="max-w-7xl mx-auto my-8">
        <h2 className="text-4xl font-bold mb-4">Inspiration for future getaways</h2>
        <MediumCard />
      </section>

      {/* large card */}
      <section className="max-w-7xl mx-auto my-8">
        <LargeCard />
      </section>

      <Footer />
    </div>
  );
}
