"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Listings from "@/components/HomeComponents/MainPageHomeListings";
import MediumCard from "@/components/HomeComponents/MediumCard";
import LargeCard from "@/components/HomeComponents/LargeCard";
import Footer from "@/components/Footer";
import { geocodeAddress } from "@/utils/geocoding"

export default function Home() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [city, setCity] = useState<string>("Ho Chi Minh City"); // default
  const [loadingCity, setLoadingCity] = useState(true);

  const checkin = "2025-08-11";
  const checkout = "2025-12-20";
  const guests = 1;

  useEffect(() => {
    async function determineLocation() {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        );
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // Gọi API reverse geocoding (Google, OpenStreetMap, backend của bạn) để lấy city
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const detectedCity =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.state ||
          "Unknown";
        setCity(detectedCity);
      } catch (error) {
        console.error(error);
        // fallback nếu không lấy được GPS
        setCoords({ latitude: 10.7769, longitude: 106.7009 });
        setCity("Ho Chi Minh City");
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

      {/* Listings section */}
      <section className="max-w-screen-3xl mx-auto px-4">
        {loadingCity || !coords ? (
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
