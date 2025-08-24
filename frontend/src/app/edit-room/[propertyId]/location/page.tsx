"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

type SuggestItem = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, any>;
};

export default function LocationPage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address + coordinates
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  // Search
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load property
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`properties/${propertyId}`);
        const data = res.data?.data ?? res.data;
        setAddress(data?.address || "");
  setStreet("");
        setWard(data?.ward || "");
        setProvince(data?.province || "");
        setCountry(data?.country || "");
        const la = Number(data?.latitude);
        const lo = Number(data?.longitude);
        setLat(Number.isFinite(la) ? la : null);
        setLon(Number.isFinite(lo) ? lo : null);
        // Prime search input with full formatted address
        setQuery(
          data?.address ||
            [data?.ward, data?.province, data?.country].filter(Boolean).join(", ")
        );
      } catch (err: any) {
        console.error("Failed to load property location", err);
        setError(
          err?.response?.data?.message || err.message || "Failed to load location"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  // Suggestion search with debounce against Nominatim
  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "vi,en" },
        });
        const json: SuggestItem[] = await res.json();
        setSuggestions(json || []);
      } catch (e) {
        // ignore
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    // cleanup
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pickSuggestion = (s: SuggestItem) => {
    setQuery(s.display_name || "");
    const la = Number(s.lat);
    const lo = Number(s.lon);
    if (Number.isFinite(la)) setLat(la);
    if (Number.isFinite(lo)) setLon(lo);

    const a = s.address || {};
    // Normalize common OSM keys to our fields
    const streetLine = [a.house_number, a.road]
      .filter(Boolean)
      .join(" ");
    setStreet(streetLine || "");
    setAddress(s.display_name || "");
    setWard(
      a.quarter || a.suburb || a.neighbourhood || a.village || a.hamlet || ""
    );
    setProvince(
      a.city || a.town || a.county || a.state_district || a.state || ""
    );
    setCountry(a.country || "");
    setSuggestions([]);
  };

  // Compose the address shown and saved from parts when available
  const composedAddress = useMemo(() => {
    const base = street || address;
    return [base, ward, province, country].filter(Boolean).join(", ");
  }, [street, address, ward, province, country]);

  const embedUrl = useMemo(() => {
    if (lat == null || lon == null) return "";
    const dLat = 0.01;
    const dLon = 0.01;
    const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat]
      .map((n) => n.toFixed(6))
      .join("%2C");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(
      6
    )}%2C${lon.toFixed(6)}`;
  }, [lat, lon]);

  const save = async () => {
    if (!propertyId || lat == null || lon == null) return;
    try {
      setSaving(true);
      setError(null);
      await api.patch(`properties/${propertyId}`, {
  address: composedAddress,
        ward,
        province,
        country,
        latitude: lat,
        longitude: lon,
      });
      window.alert("Location saved");
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
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Location</h1>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-3 flex items-center gap-1 text-gray-600">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
          </div>
        )}

        {/* Map */}
        <div className="mt-8">
          <div className="relative overflow-hidden rounded-2xl shadow ring-1 ring-black/5">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                className="h-[320px] w-full"
                src={embedUrl}
                loading="lazy"
              />
            ) : (
              <div className="grid h-[320px] w-full place-items-center text-gray-500">
                No coordinates yet
              </div>
            )}
            <div className="pointer-events-none absolute right-4 top-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-700 shadow ring-1 ring-black/5">
                Adjust via search below
              </span>
            </div>
          </div>
        </div>

  {/* Search and suggestions */}
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search and adjust location
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an address, ward, city..."
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {suggestLoading && (
            <div className="mt-2 text-sm text-gray-500">Searching…</div>
          )}
          {suggestions.length > 0 && (
            <div className="mt-2 max-h-64 overflow-auto rounded-2xl border border-gray-200 bg-white p-2 shadow">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => pickSuggestion(s)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address summary and fields */}
        <div className="mt-8 space-y-4">
          <div>
            <div className="text-sm font-semibold text-gray-800">Address</div>
            <div className="text-gray-700">{composedAddress || "—"}</div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Street" value={street} onChange={setStreet} />
            <Field label="Ward" value={ward} onChange={setWard} />
            <Field label="Province" value={province} onChange={setProvince} />
            <Field label="Country" value={country} onChange={setCountry} />
          </div>
        </div>

        

        {/* Save button bottom */}
        <div className="mt-60 flex justify-end">
          <button
            onClick={save}
            disabled={saving || lat == null || lon == null}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saving || lat == null || lon == null
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
