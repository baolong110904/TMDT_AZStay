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
  }, [propertyId, title, description, router, guests, userId]);

  useEffect(() => {
    setNav({ next: `/become-a-host/${userId}/standout`, prev: `/become-a-host/${userId}/about-your-place`, currentStep, totalSteps });
    const can = Boolean(guests > 0 && title.trim() !== "");
    setCanProceed(can);
    setOnNext(() => handleSave);
    return () => setOnNext(null);
  }, [guests, title, userId, setCanProceed, setNav, setOnNext, handleSave]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Share some basics about your place</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <div className="text-base font-medium">Guests</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                aria-label="decrease guests"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg"
                disabled={guests <= 1}
              >
                −
              </button>
              <div className="min-w-[32px] text-center">{guests}</div>
              <button
                aria-label="increase guests"
                onClick={() => setGuests((g) => g + 1)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-[0.5px] border-gray-300 rounded px-3 py-2" placeholder="Name your listing" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border-[0.5px] border-gray-300 rounded px-3 py-2 h-28" placeholder="Describe your place" />
        </div>

            <div className="mt-6 flex justify-end">
              {/* Save is handled by the layout Next button via setOnNext — remove in-page save button */}
            </div>
      </div>
    </div>
  );
}