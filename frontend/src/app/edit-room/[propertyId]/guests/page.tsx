"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Image from "next/image";
import guestImg from "@/assets/guests.jpg";

export default function GuestsPage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(1);

  const MIN = 1;
  const MAX = 50;

  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`properties/${propertyId}`);
        const data = res.data?.data ?? res.data;
        const g = Number(data?.max_guest ?? 1);
        setGuests(Number.isFinite(g) && g >= MIN ? Math.min(g, MAX) : MIN);
      } catch (err: any) {
        console.error("Failed to fetch guests", err);
        setError(err?.response?.data?.message || err.message || "Failed to load guests");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const dec = () => setGuests((n) => Math.max(MIN, n - 1));
  const inc = () => setGuests((n) => Math.min(MAX, n + 1));

  const save = async () => {
    if (!propertyId) return;
    try {
      setSaving(true);
      setError(null);
      await api.patch(`properties/${propertyId}`, { max_guest: guests });
      window.alert("Guests saved");
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Guests</h1>
        <p className="mt-2 text-gray-600">Set the maximum number of guests for your listing.</p>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-4 flex items-center gap-1 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
          </div>
        )}

        {/* Image */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow ring-1 ring-black/5">
            <Image src={guestImg} width={640} height={427} alt="Guests" priority className="h-auto w-full object-cover" />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={dec}
            disabled={guests <= MIN}
            className={`grid h-14 w-14 place-items-center rounded-full border text-2xl font-bold transition ${
              guests <= MIN
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
            aria-label="Decrease guests"
          >
            –
          </button>

          <div className="min-w-[110px] text-center">
            <div className="text-6xl font-extrabold text-gray-900 leading-none">{guests}</div>
            <div className="mt-2 text-sm text-gray-500">guests</div>
          </div>

          <button
            onClick={inc}
            disabled={guests >= MAX}
            className={`grid h-14 w-14 place-items-center rounded-full border text-2xl font-bold transition ${
              guests >= MAX
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
            aria-label="Increase guests"
          >
            +
          </button>
        </div>

        {/* Save button bottom */}
        <div className="mt-30 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saving
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
