"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import ExploreNearby from '@/components/ExploreNearby';
import Listings from '@/components/Listings';
import MediumCard from '@/components/MediumCard';
import LargeCard from '@/components/LargeCard';
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
        setCity('Ho Chi Minh City'); 
      } catch (error) {
        console.error('Location error:', error);
        setCoords({ latitude: 10.7769, longitude: 106.7009 }); // Ho Chi Minh City fallback
        setCity('Ho Chi Minh City');
      } finally {
        setLoadingCity(false);
      }
    }
    determineLocation();
  }, []);

  return (
    <>
      <Header />
      <Banner />
      <section className="max-w-7xl mx-auto my-8">
        {coords ? (
          <ExploreNearby latitude={coords.latitude} longitude={coords.longitude} />
        ) : (
          <p className="text-center">Loading nearby locations…</p>
        )}
      </section>

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
      <section className="max-w-7xl mx-auto my-8">
        <h2 className="text-4xl font-bold mb-4">Inspiration for future getaways</h2>
        <MediumCard />
      </section>
      <section className="max-w-7xl mx-auto my-8">
        <LargeCard />
      </section>

      <Footer />
    </>
  );
}