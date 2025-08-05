"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Define the Experience type
type Experience = {
  id: string;
  title: string;
  image: string;
  time: string;
  price: string;
  rating: string;
};

// Sample data for experiences
const experiences: Record<string, Experience[]> = {
  today: [
    {
      id: "1",
      title: "Top Rated Street Food Tour by Motorbike",
      image: "/assets/experience.png",
      time: "1PM",
      price: "₫680,000",
      rating: "4.87",
    },
    {
      id: "2",
      title: "Ben Duoc: Less-Crowded CuChi Tunnel Half-Day Tour",
      image: "/assets/experience.png",
      time: "7AM",
      price: "₫799,000",
      rating: "4.87",
    },
    {
      id: "3",
      title: "Female Rider - Street Food & Sightseeing by scooter",
      image: "/assets/experience.png",
      time: "11AM",
      price: "₫570,000",
      rating: "4.95",
    },
    {
      id: "4",
      title: "Saigon Eleven Tastings Food Tour by Scooter",
      image: "/assets/experience.png",
      time: "7:30PM",
      price: "₫680,000",
      rating: "4.98",
    },
    {
      id: "5",
      title: "Private Saigon History, Hidden Gems Motorbike Tour",
      image: "/assets/experience.png",
      time: "7AM",
      price: "₫750,000",
      rating: "4.97",
    },
  ],
  tomorrow: [
    {
      id: "6",
      title: "Cu Chi Tunnels & Mekong Delta - Small Group Tour",
      image: "/assets/experience.png",
      time: "7:30AM",
      price: "₫990,000",
      rating: "4.85",
    },
    {
      id: "7",
      title: "Authentic 'Less-Touristy' Mekong BenTre 1-Day Tour",
      image: "/assets/experience.png",
      time: "8AM",
      price: "₫1,518,000",
      rating: "4.85",
    },
    {
      id: "8",
      title: "Discover Authentic Flavors While Local Food Tour",
      image: "/assets/experience.png",
      time: "4:30PM",
      price: "₫650,000",
      rating: "4.99",
    },
    {
      id: "9",
      title: "Private Walking Food Tour with 13 Tastings By Car",
      image: "/assets/experience.png",
      time: "9AM",
      price: "₫695,000",
      rating: "4.99",
    },
    {
      id: "10",
      title: "Vietnam coffee journey - The unknown giant",
      image: "/assets/experience.png",
      time: "7AM",
      price: "₫680,000",
      rating: "4.99",
    },
  ],
  weekend: [
    {
      id: "11",
      title: "Grandma Noodles, Coffee, Exotic Fruits & History",
      image: "/assets/experience.png",
      time: "7AM",
      price: "₫750,000",
      rating: "4.98",
    },
    {
      id: "12",
      title: "Authentic 'Less-Touristy' Mekong BenTre 1-Day Tour",
      image: "/assets/experience.png",
      time: "5:30PM",
      price: "₫1,518,000",
      rating: "4.85",
    },
    {
      id: "13",
      title: "Local Lesser-Known Mekong Delta MyTho 1-Day Tour",
      image: "/assets/experience.png",
      time: "7AM",
      price: "₫1,088,000",
      rating: "4.88",
    },
    {
      id: "14",
      title: "Saigon Craft Beer and Local Food Tour By Scooter",
      image: "/assets/experience.png",
      time: "7PM",
      price: "₫1,100,000",
      rating: "4.84",
    },
  ],
};

// Main ExperiencePage component
export default function ExperiencePage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto my-8 bg-white">
        <h1 className="text-4xl font-bold mb-4">Experience Page</h1>
        <p className="text-lg mb-8">
          Discover the best experiences in Ho Chi Minh City. Book your next adventure today!
        </p>

        {/* Experience Sections */}
        <ExperienceSection
          title="HAPPENING TODAY IN HO CHI MINH CITY"
          experiences={experiences.today}
        />
        <ExperienceSection
          title="TOMORROW IN HO CHI MINH CITY"
          experiences={experiences.tomorrow}
        />
        <ExperienceSection
          title="EXPERIENCE THIS WEEKEND"
          experiences={experiences.weekend}
        />
      </main>
      <Footer />
    </>
  );
}

// ExperienceSection component for each category
function ExperienceSection({
  title,
  experiences,
}: {
  title: string;
  experiences: Experience[];
}) {
  return (
    <section className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold uppercase text-gray-900">{title}</h2>
        <Link href={`/experience/${title.toLowerCase().replace(/\s+/g, "-")}`}>
          <span className="text-xl text-gray-600 cursor-pointer hover:text-gray-900 transition duration-300">
            ›
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>
    </section>
  );
}

// ExperienceCard component for individual cards
function ExperienceCard({ experience }: { experience: Experience }) {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <Link href={`/experience/${experience.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105">
        <div className="relative">
          <Image
            src={experience.image}
            alt={experience.title}
            width={300}
            height={200}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full shadow-md">
            <span className="text-sm font-semibold text-gray-800">
              {experience.time}
            </span>
          </div>
          <button
            className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
          >
            <span
              className={`text-2xl ${
                isFavorited ? "text-red-500" : "text-gray-500"
              } hover:text-red-600 transition duration-300`}
            >
              {isFavorited ? "♥" : "♡"}
            </span>
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {experience.title}
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              From {experience.price} / guest
            </span>
            <span className="text-sm font-bold text-yellow-500">
              ★ {experience.rating}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}