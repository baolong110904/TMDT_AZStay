"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
// import ExploreNearby from '@/components/ExploreNearby';
import Listings from '@/components/Home/MainPageHomeListings';
import MediumCard from '@/components/Home/MediumCard';
import LargeCard from '@/components/Home/LargeCard';
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

        // Gửi tọa độ lên API backend của bạn để lấy city và danh sách
        const response = await fetch(
          `/api/listings?lat=${latitude}&lng=${longitude}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        setCity(data.city || "Unknown city");
        // bạn có thể lưu thêm danh sách nếu muốn show trực tiếp tại đây

      } catch (error) {
        console.log(error);
        setCoords({ latitude: 10.7769, longitude: 106.7009 }); // fallback
        setCity("Ho Chi Minh City"); // default location
      } finally {
        setLoadingCity(false);
      }
    }

    determineLocation();
  }, []);

  return (
    <div className="w-full">
      <Header />
      <Banner />

      {/* Listing location for customer */}
      <section className="max-w-screen-3xl">
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
      <section className="max-w-screen-3xl">
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
      <section className="max-w-screen-3xl">
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
      {/* Medium card */}
      <section className="w-full my-8 px-4">
        <h2 className="text-4xl font-bold mb-4">Inspiration for future getaways</h2>
        <MediumCard />
      </section>

      {/* Large card */}
      <section className="w-full my-8 px-4">
        <LargeCard />
      </section>

      <Footer />
    </div>
  );

}