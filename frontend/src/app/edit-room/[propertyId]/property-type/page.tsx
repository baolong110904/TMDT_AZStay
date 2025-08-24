"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

type Category = {
  category_id: number;
  sub_category_id?: number | null;
  category_name: string;
  image_url?: string | null;
};

// Static catalog based on your CSV (5 parents + 17 children)
const CATEGORIES: Category[] = [
  { category_id: 1, sub_category_id: null, category_name: "Apartment" },
  { category_id: 2, sub_category_id: null, category_name: "Home" },
  { category_id: 3, sub_category_id: null, category_name: "Villa" },
  { category_id: 4, sub_category_id: null, category_name: "Bungalow" },
  { category_id: 5, sub_category_id: null, category_name: "Homestay" },
  { category_id: 6, sub_category_id: 1, category_name: "Studio Apartment" },
  { category_id: 7, sub_category_id: 1, category_name: "Penthouse Apartment" },
  { category_id: 8, sub_category_id: 1, category_name: "Serviced Apartment" },
  { category_id: 9, sub_category_id: 2, category_name: "Townhouse" },
  { category_id: 10, sub_category_id: 2, category_name: "House In The Alley" },
  { category_id: 11, sub_category_id: 3, category_name: "Beachfront Villa" },
  { category_id: 12, sub_category_id: 3, category_name: "Luxury Villa" },
  { category_id: 13, sub_category_id: 3, category_name: "Private Pool Villa" },
  { category_id: 14, sub_category_id: 3, category_name: "Hillside Villa" },
  { category_id: 15, sub_category_id: 3, category_name: "Eco Villa" },
  { category_id: 16, sub_category_id: 4, category_name: "Traditional Bungalow" },
  { category_id: 17, sub_category_id: 4, category_name: "Modern Bungalow" },
  { category_id: 18, sub_category_id: 4, category_name: "Beach Bungalow" },
  { category_id: 19, sub_category_id: 4, category_name: "Garden Bungalow" },
  { category_id: 20, sub_category_id: 5, category_name: "Private Room in Home" },
  { category_id: 21, sub_category_id: 5, category_name: "Shared Room in Home" },
  { category_id: 22, sub_category_id: 5, category_name: "Family Homestay" },
];

const PARENTS = CATEGORIES.filter((c) => !c.sub_category_id);
const CHILDREN = CATEGORIES.filter((c) => !!c.sub_category_id);

export default function PropertyTypePage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The chosen leaf category id (child), which will be saved to property.category_id
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  // The active parent tab
  const [activeParentId, setActiveParentId] = useState<number>(1);

  // Derive selected label and sync active parent with selected child
  const selectedChild = useMemo(
    () => CHILDREN.find((c) => c.category_id === selectedChildId) || null,
    [selectedChildId]
  );

  useEffect(() => {
    if (!selectedChild) return;
    if (selectedChild.sub_category_id) setActiveParentId(selectedChild.sub_category_id);
  }, [selectedChild]);

  // Load current property to get its existing category
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`properties/${propertyId}`);
        const data = res.data?.data ?? res.data;
        const catId: number | null = data?.category_id ?? data?.category?.category_id ?? null;
        if (catId && CHILDREN.some((c) => c.category_id === catId)) {
          setSelectedChildId(Number(catId));
        } else if (catId && PARENTS.some((p) => p.category_id === catId)) {
          // If a parent was stored, just switch the active tab
          setActiveParentId(Number(catId));
        }
      } catch (err: any) {
        console.error("Failed to fetch property", err);
        setError(err?.response?.data?.message || err.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const childrenOfActive = useMemo(
    () => CHILDREN.filter((c) => c.sub_category_id === activeParentId),
    [activeParentId]
  );

  const save = async () => {
    if (!selectedChildId || !propertyId) return;
    try {
      setSaving(true);
      setError(null);
      await api.patch(`properties/${propertyId}`, { category_id: selectedChildId });
      window.alert("Saved property type");
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Property type</h1>
            <p className="mt-2 text-gray-600">Choose the category that best describes your place.</p>
            {selectedChild && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-gray-700 ring-1 ring-black/5">
                Selected: <span className="font-medium text-indigo-700">{selectedChild.category_name}</span>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-3 flex items-center gap-1 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
          </div>
        )}

        {/* Parent tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {PARENTS.map((p) => (
            <button
              key={p.category_id}
              onClick={() => setActiveParentId(p.category_id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                p.category_id === activeParentId
                  ? "border-indigo-500 bg-white text-indigo-700 shadow"
                  : "border-gray-300 bg-white/80 text-gray-700 hover:bg-white"
              }`}
            >
              {p.category_name}
            </button>
          ))}
        </div>

        {/* Children grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childrenOfActive.map((c) => {
            const selected = selectedChildId === c.category_id;
            return (
              <button
                key={c.category_id}
                onClick={() => setSelectedChildId(c.category_id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-indigo-500 bg-white shadow"
                    : "border-gray-200 bg-white/80 hover:bg-white"
                }`}
              >
                <div>
                  <div className="text-base font-semibold text-gray-900">{c.category_name}</div>
                  <div className="text-xs text-gray-500">{parentName(c.sub_category_id)}</div>
                </div>
                {selected && (
                  <span className="ml-3 inline-block rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">Selected</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Helper note */}
        <p className="mt-6 text-xs text-gray-500">
          Your selection will be saved to this property’s category. You can change it later.
        </p>

        {/* Save button moved to bottom */}
        <div className="mt-60 flex justify-end">
          <button
            onClick={save}
            disabled={saving || !selectedChildId}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saving || !selectedChildId
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function parentName(parentId?: number | null) {
  if (!parentId) return "";
  const p = PARENTS.find((x) => x.category_id === parentId);
  return p?.category_name || "";
}
