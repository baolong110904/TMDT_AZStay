"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useHostFlow } from "@/components/HostFlowProvider";

export default function FloorPlanPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const propertyId = searchParams?.get("property_id");

  const totalSteps = 7;
  const currentStep = 4; // about-your-place -> floor-plan -> location

  const [guests, setGuests] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const { setCanProceed, setNav } = useHostFlow();
  const { setOnNext } = useHostFlow() as any;

  const images = [
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/50f7cb91-d0fe-4726-963c-7242660b1db3.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/5f95c6dc-e60c-4d8b-8030-38891171e55a.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/8b90c490-dac6-456c-9a12-752369fcecc9.png",
    "https://a0.muscache.com/im/pictures/mediaverse/MYS%20Number%20of%20Guests/original/66c8a44b-b1f5-49fc-b071-93a052c71715.png",
  ];

  const handleSave = useCallback(async () => {
    try {
      if (!propertyId) {
        alert("No property_id provided in query. The data will not be saved to backend.");
        return;
      }
      setSaving(true);
      const token = localStorage.getItem("token");
      await api.patch(
        `/properties/${propertyId}`,
        {
          max_guest: Number(guests),
          title: title.trim(),
          description: description.trim(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      alert("Saved");
      // route to standout page and preserve property_id and userId
      if (propertyId) {
        router.push(`/become-a-host/${userId}/standout?property_id=${encodeURIComponent(String(propertyId))}`);
      } else {
        router.push(`/become-a-host/${userId}/standout`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save floor plan");
    } finally {
      setSaving(false);
    }
  }, [propertyId, title, description, router]);

  useEffect(() => {
    setNav({ next: `/become-a-host/${userId}/standout`, prev: `/become-a-host/${userId}/about-your-place`, currentStep, totalSteps });
    const can = Boolean(guests > 0 && title.trim() !== "");
    setCanProceed(can);
    setOnNext(() => handleSave);
    return () => setOnNext(null);
  }, [guests, title, userId, setCanProceed, setNav, setOnNext, handleSave]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Share some basics about your place</h1>
      <p className="mt-2 text-gray-600">Set the essentials so guests know what to expect.</p>

      {/* Inspiration images above Guests */}
      <div className="mt-6 mx-auto w-fit flex flex-nowrap items-end justify-center">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`floor-plan-inspiration-${i + 1}`}
            className={`relative block h-16 md:h-24 object-cover ${
              i % 2 === 0 ? "translate-y-1 md:translate-y-1" : "-translate-y-1 md:-translate-y-1"
            } ${i > 0 ? "-ml-8 sm:-ml-20 md:-ml-24" : "ml-0"}`}
            style={{ zIndex: i + 1 }}
            loading="lazy"
          />
        ))}
      </div>

      {/* Guests */}
      <section className="mt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-semibold text-gray-900">Guests</div>
            <div className="text-sm text-gray-500">How many people can stay?</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              aria-label="decrease guests"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl disabled:opacity-50"
              disabled={guests <= 1}
            >
              −
            </button>
            <div className="min-w-[40px] text-center text-xl font-semibold text-gray-900">{guests}</div>
            <button
              aria-label="increase guests"
              onClick={() => setGuests((g) => g + 1)}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Title */}
      <section className="mt-5">
        <label className="block text-xl font-semibold mb-2">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Title</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-2xl border border-gray-300/60 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="Name your listing"
        />
        <p className="mt-1 text-sm text-gray-500">Make it short, unique, and memorable.</p>
      </section>

      {/* Description */}
      <section className="mt-4">
        <label className="block text-xl font-semibold mb-2">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">Description</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-2xl border border-gray-300/60 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-32"
          placeholder="Describe your place"
        />
        <p className="mt-1 text-sm text-gray-500">Highlight special features, style, and nearby attractions.</p>
      </section>

      {/* Spacer for layout Next button */}
      <div className="mt-10" />
    </div>
  );
}