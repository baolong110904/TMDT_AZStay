"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

export default function PricingPage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We keep a string for the input and derive a numeric value for saving
  const [priceInput, setPriceInput] = useState<string>("");

  // Parse the string into a number; strip any separators (.,, spaces)
  const priceValue = useMemo<number | null>(() => {
    if (priceInput.trim() === "") return null;
    const digitsOnly = priceInput.replace(/[^0-9]/g, "");
    const n = Number(digitsOnly);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [priceInput]);

  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`properties/${propertyId}`);
        const data = res.data?.data ?? res.data;
        const raw = data?.min_price;
        const num = typeof raw === "string" ? Number(raw) : Number(raw ?? 0);
        if (Number.isFinite(num)) {
          setPriceInput(formatNumber(num));
        }
      } catch (err: any) {
        console.error("Failed to fetch price", err);
        setError(err?.response?.data?.message || err.message || "Failed to load price");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const onBlurFormat = () => {
    if (priceValue === null) return;
    setPriceInput(formatNumber(priceValue));
  };

  const save = async () => {
    if (!propertyId || priceValue === null) return;
    try {
      setSaving(true);
      setError(null);
      await api.patch(`properties/${propertyId}`, { min_price: priceValue });
      window.alert("Price saved");
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
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Pricing</h1>
        <p className="mt-2 text-gray-600">Set the base price per month for your listing.</p>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-4 flex items-center justify-start text-gray-600">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="ml-1 w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="ml-1 w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          </div>
        )}

        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Base price (VND)</label>
          <div className="relative max-w-md">
            <input
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={onBlurFormat}
              placeholder="1.000.000"
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-lg font-semibold tracking-wide text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">VND</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">Guests will see the total price with taxes and fees at checkout.</p>
        </div>

        {/* Save button bottom */}
        <div className="mt-60 flex justify-end">
          <button
            onClick={save}
            disabled={saving || priceValue === null}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saving || priceValue === null
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

function formatNumber(n: number): string {
  try {
    return new Intl.NumberFormat("vi-VN").format(n);
  } catch {
    return String(n);
  }
}
