"use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import { useState, useEffect } from "react";
import SearchHomeListings from "@/components/Search/SearchPageHomeListing";
// raw data

import { mockListings } from "@/components/Search/mockListing";

export default function SearchPage() {
  // const [rawLocaltion, setRawLocation] = useState([null]);

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-screen-3xl">
        {mockListings.length === 0 ? (
          <p className="text-center">No data</p>
        ) : (
          <SearchHomeListings list={mockListings} />
        )}
      </div>
      <Footer />
    </div>
  );
}