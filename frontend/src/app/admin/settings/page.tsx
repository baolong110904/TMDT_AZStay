"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";
import AdminHeader from "@/components/AdminHeader";
import api from "@/lib/axios";
import { FaArrowRight } from "react-icons/fa";

const cities = [
  "An Giang",
  "Ba Ria Vung Tau",
  "Bac Giang",
  "Bac Kan",
  "Bac Lieu",
  "Bac Ninh",
  "Ben Tre",
  "Binh Dinh",
  "Binh Duong",
  "Binh Phuoc",
  "Binh Thuan",
  "Ca Mau",
  "Cao Bang",
  "Can Tho",
  "Da Nang",
  "Dak Lak",
  "Dak Nong",
  "Dien Bien",
  "Dong Nai",
  "Dong Thap",
  "Gia Lai",
  "Ha Giang",
  "Ha Nam",
  "Ha Noi",
  "Ha Tinh",
  "Hai Duong",
  "Hai Phong",
  "Hau Giang",
  "Hoa Binh",
  "Hung Yen",
  "Khanh Hoa",
  "Kien Giang",
  "Kon Tum",
  "Lai Chau",
  "Lam Dong",
  "Lang Son",
  "Lao Cai",
  "Long An",
  "Nam Dinh",
  "Nghe An",
  "Ninh Binh",
  "Ninh Thuan",
  "Phu Tho",
  "Phu Yen",
  "Quang Binh",
  "Quang Nam",
  "Quang Ngai",
  "Quang Ninh",
  "Quang Tri",
  "Soc Trang",
  "Son La",
  "Tay Ninh",
  "Thai Binh",
  "Thai Nguyen",
  "Thanh Hoa",
  "Thua Thien Hue",
  "Tien Giang",
  "Ho Chi Minh",
  "Tra Vinh",
  "Tuyen Quang",
  "Vinh Long",
  "Vinh Phuc",
  "Yen Bai",
];

type Listing = {
  title: string;
  price: number;
  currency: string;
  description: string;
  rating: number;
  reviewCount: number;
  link: string;
  imageUrl: string;
  checkInDate: string;
  checkOutDate: string;
};

export default function SettingPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<Listing[]>([]);
  const router = useRouter();

  // check role
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role_id);
        if (parsedUser.role_id !== 1) {
          router.push("/user/profile");
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // load previous results if exist
  useEffect(() => {
    const stored = sessionStorage.getItem("seedResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = async () => {
    if (!selectedCity) {
      setMessage("Please select a city.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post("http://localhost:4000/api/seed/manual", {
        city: selectedCity,
      });

      const listings: Listing[] = res.data.data?.result || [];
      setResults(listings);

      // store in session storage
      sessionStorage.setItem("seedResults", JSON.stringify(listings));

      setMessage(
        res.data.message || `✅ Seeding completed for ${selectedCity}`
      );
    } catch (err: any) {
      console.error("Seed error:", err.response?.data || err.message);
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />

        <h2 className="text-xl font-semibold mb-4">Manual Seed City</h2>

        {/* City selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
          {cities.map((city) => (
            <label key={city} className="flex items-center space-x-2">
              <input
                type="radio"
                name="city"
                value={city}
                checked={selectedCity === city}
                onChange={() => setSelectedCity(city)}
                className="h-4 w-4"
              />
              <span>{city}</span>
            </label>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-emerald-500 text-white rounded-3xl shadow hover:bg-emerald-600 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          )}
          <span>{loading ? "Seeding..." : "Start Seeding"}</span>
        </button>

        {/* Message */}
        {message && <p className="mt-4 text-sm">{message}</p>}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Seeded Listings in {selectedCity}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 rounded-3xl p-3 shadow-sm"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="mt-1 font-medium">
                    {item.price.toLocaleString()} {item.currency}
                  </p>
                  <p className="text-xs text-gray-500">
                    ⭐ {item.rating} ({item.reviewCount} reviews)
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View on Airbnb →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
