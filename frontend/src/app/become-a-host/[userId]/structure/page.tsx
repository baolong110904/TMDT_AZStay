"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import { useHostFlow } from "@/components/HostFlowProvider";

//Import icons 
import { FaBuilding, FaHome, FaSwimmingPool, FaTree, FaHotel, FaBed, FaCouch, FaUmbrellaBeach, FaMountain, FaLeaf, FaUsers, FaDoorOpen } from "react-icons/fa";

const categories = [
  { category_id: 1, sub_category_id: null, category_name: "Apartment", icon: <FaBuilding size={32} /> },
  { category_id: 2, sub_category_id: null, category_name: "Home", icon: <FaHome size={32} /> },
  { category_id: 3, sub_category_id: null, category_name: "Villa", icon: <FaSwimmingPool size={32} /> },
  { category_id: 4, sub_category_id: null, category_name: "Bungalow", icon: <FaTree size={32} /> },
  { category_id: 5, sub_category_id: null, category_name: "Homestay", icon: <FaHotel size={32} /> },
  { category_id: 6, sub_category_id: 1, category_name: "Studio Apartment", icon: <FaCouch size={32} /> },
  { category_id: 7, sub_category_id: 1, category_name: "Penthouse Apartment", icon: <FaBuilding size={32} /> },
  { category_id: 8, sub_category_id: 1, category_name: "Serviced Apartment", icon: <FaBed size={32} /> },
  { category_id: 9, sub_category_id: 2, category_name: "Townhouse", icon: <FaHome size={32} /> },
  { category_id: 10, sub_category_id: 2, category_name: "House In The Alley", icon: <FaDoorOpen size={32} /> },
  { category_id: 11, sub_category_id: 3, category_name: "Beachfront Villa", icon: <FaUmbrellaBeach size={32} /> },
  { category_id: 12, sub_category_id: 3, category_name: "Luxury Villa", icon: <FaSwimmingPool size={32} /> },
  { category_id: 13, sub_category_id: 3, category_name: "Private Pool Villa", icon: <FaSwimmingPool size={32} /> },
  { category_id: 14, sub_category_id: 3, category_name: "Hillside Villa", icon: <FaMountain size={32} /> },
  { category_id: 15, sub_category_id: 3, category_name: "Eco Villa", icon: <FaLeaf size={32} /> },
  { category_id: 16, sub_category_id: 4, category_name: "Traditional Bungalow", icon: <FaTree size={32} /> },
  { category_id: 17, sub_category_id: 4, category_name: "Modern Bungalow", icon: <FaHome size={32} /> },
  { category_id: 18, sub_category_id: 4, category_name: "Beach Bungalow", icon: <FaUmbrellaBeach size={32} /> },
  { category_id: 19, sub_category_id: 4, category_name: "Garden Bungalow", icon: <FaTree size={32} /> },
  { category_id: 20, sub_category_id: 5, category_name: "Private Room in Home", icon: <FaBed size={32} /> },
  { category_id: 21, sub_category_id: 5, category_name: "Shared Room in Home", icon: <FaUsers size={32} /> },
  { category_id: 22, sub_category_id: 5, category_name: "Family Homestay", icon: <FaHotel size={32} /> },
];

export default function StructurePage() {
  const router = useRouter();
  const params = useParams();
  // no per-page pathname needed; layout controls transitions
  const userId = params?.userId as string;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { setCanProceed, setNav } = useHostFlow();
  const { setOnNext } = useHostFlow() as any;

  const handleSubmit = useCallback(async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/properties/create-property",
        {
          user_id: userId,
          category_id: Number(selectedCategory),
          draft: true,
          title: "",
          address: "Hà Nội, Việt Nam",
          max_guest: 1,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const respData = response?.data || {};
      const id =
        respData?.createdProperty?.property_id ||
        respData?.createProperty?.property_id ||
        respData?.property?.property_id ||
        respData?.property_id ||
        respData?.id ||
        null;

      if (respData?.token) {
        localStorage.setItem("token", respData.token);
      }

      if (id) {
        router.push(`/become-a-host/${userId}/location?property_id=${encodeURIComponent(String(id))}`);
      } else {
        router.push(`/become-a-host/${userId}/location`);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create property. Please login again.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, userId, router]);

  useEffect(() => {
    setNav({ next: `/become-a-host/${userId}/location`, prev: `/become-a-host/${userId}/about-your-place`, currentStep: 2, totalSteps: 7 });
    setCanProceed(Boolean(selectedCategory));
    if (setOnNext) setOnNext(() => handleSubmit);
    return () => {
      setCanProceed(false);
      if (setOnNext) setOnNext(null);
    };
  }, [userId, selectedCategory, setCanProceed, setNav, setOnNext, handleSubmit]);

  return (
      <div className="flex-1 flex flex-col items-center justify-center pt-0 px-6 md:px-4">
        <h1 className="text-3xl font-bold mb-8">Select your property type</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8 w-full max-w-10xl">
        {categories.map((cat) => (
          <label
            key={cat.category_id}
            className={`border rounded-lg px-6 py-6 cursor-pointer flex flex-col items-center gap-3 transition ${
              selectedCategory === cat.category_id ? "border-blue-500 bg-blue-50 shadow" : "border-gray-200 bg-white"
            }`}
          >
            <input
              type="radio"
              name="category"
              value={cat.category_id}
              checked={selectedCategory === cat.category_id}
              onChange={() => setSelectedCategory(cat.category_id)}
              className="accent-blue-500 mb-2"
              style={{ display: "none" }}
            />
            <div className="text-blue-500">{cat.icon}</div>
            <span className="text-lg text-center">{cat.category_name}</span>
          </label>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}