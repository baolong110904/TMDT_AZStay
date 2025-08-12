import React from 'react';
import Image from 'next/image';
import LargeCardImg from '@/assets/largecard.png'; // use your uploaded image here

export default function LargeCard() {
  return (
    <section className="relative py-16">
      <div className="relative h-96 min-w-[300px] rounded-3xl overflow-hidden">
        <Image
          src={LargeCardImg}
          alt="The Greatest Outdoors"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Text content overlay */}
      <div className="absolute top-1/2 left-12 -translate-y-1/2 text-black">
        <h3 className="text-4xl font-semibold mb-2 leading-tight">
          The Greatest Outdoors
        </h3>
        <p className="text-lg mb-4">Wishlists curated by Airbnb</p>
        <button className="text-sm text-white bg-gray-900 px-4 py-2 rounded-lg mt-1
          hover:bg-gray-800 hover:scale-105 hover:shadow-lg 
          transition-all duration-200 ease-in-out">
          Get Inspired
        </button>

      </div>
    </section>
  );
}
