"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";

type Property = {
  property_id: string;
  title: string;
  description?: string;
  address?: string | null;
  province?: string | null;
  country?: string | null;
  max_guest?: number | null;
  min_price?: number | null;
  is_available?: boolean | null;
  propertyimage?: { image_id: string; image_url: string; is_cover: boolean }[];
};

type Auction = {
  auction_id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  status: string;
  final_price?: number | null;
  winner_id?: string | null;
};

export default function EditRoomPage() {
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [form, setForm] = useState<any>({});
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    fetchProperty();
    fetchAuctionsForProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await api.get(`properties/${propertyId}`);
      const data = res.data?.data ?? res.data;
      setProperty(data);
      setForm({
        title: data?.title || "",
        description: data?.description || "",
        address: data?.address || "",
        max_guest: data?.max_guest ?? 1,
        min_price: data?.min_price ?? 0,
        is_available: !!data?.is_available,
      });
    } catch (err: any) {
      console.error("Failed to load property", err);
      setError(err?.response?.data?.message || err.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

  const saveProperty = async () => {
    try {
      setLoading(true);
      const payload: any = {
        title: form.title,
        description: form.description,
        address: form.address,
        max_guest: Number(form.max_guest),
        min_price: Number(form.min_price),
        is_available: !!form.is_available,
      };
      const res = await api.patch(`properties/${propertyId}`, payload);
      const data = res.data?.data ?? res.data;
      setProperty(data);
      window.alert("Property updated");
    } catch (err: any) {
      console.error("Update failed", err);
      setError(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const createAuction = async (start: string, end: string) => {
    try {
      setLoading(true);
      await api.post("auction", { property_id: propertyId, start_time: start, end_time: end });
      await fetchAuctionsForProperty();
      window.alert("Auction created");
    } catch (err: any) {
      console.error("Create auction failed", err);
      setError(err?.response?.data?.message || err.message || "Create auction failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctionsForProperty = async () => {
    try {
      const res = await api.get("auction/active");
      const active: Auction[] = (res.data?.data ?? res.data ?? []).filter((a: any) => a.property_id === propertyId);
      const winsRes = await api.get("auction/my-wins");
      const wins: Auction[] = (winsRes.data?.data ?? winsRes.data ?? []).filter((a: any) => a.property_id === propertyId);
      const map = new Map<string, Auction>();
      active.concat(wins).forEach((a: Auction) => map.set(a.auction_id, a));
      setAuctions(Array.from(map.values()));
    } catch (err: any) {
      console.error("Failed to fetch auctions", err);
    }
  };

  const viewBids = async (auctionId: string) => {
    try {
      const res = await api.get(`auction/${auctionId}/bids`);
      setBids(res.data?.data ?? res.data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch bids", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch bids");
    }
  };

  const finalizeAuction = async (auctionId: string) => {
    if (!window.confirm("Are you sure you want to finalize this auction?")) return;
    try {
      setLoading(true);
      const res = await api.patch(`auction/${auctionId}/end`);
      window.alert(res.data?.message || "Auction finalized");
      await fetchAuctionsForProperty();
    } catch (err: any) {
      console.error("Finalize failed", err);
      setError(err?.response?.data?.message || err.message || "Finalize failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto py-12 px-6 h-full overflow-hidden">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-2xl font-semibold">Edit listing</h2>
            <div className="text-sm opacity-90 mt-1">Property ID: {propertyId}</div>
          </div>

          <div className="p-6">
            {loading && <div className="mb-4">Loading...</div>}
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium">Title</span>
                <input className="border rounded px-3 py-2 mt-1" value={form.title || ""} onChange={(e) => handleChange("title", e.target.value)} />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Description</span>
                <textarea className="border rounded px-3 py-2 mt-1" rows={4} value={form.description || ""} onChange={(e) => handleChange("description", e.target.value)} />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium">Address</span>
                <input className="border rounded px-3 py-2 mt-1" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Max guests</span>
                  <input type="number" className="border rounded px-3 py-2 mt-1" value={form.max_guest || 1} onChange={(e) => handleChange("max_guest", Number(e.target.value))} />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Price (min)</span>
                  <input type="number" className="border rounded px-3 py-2 mt-1" value={form.min_price || 0} onChange={(e) => handleChange("min_price", Number(e.target.value))} />
                </label>
              </div>

              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!form.is_available} onChange={(e) => handleChange("is_available", e.target.checked)} />
                <span className="text-sm">Is available (visible)</span>
              </label>

              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={saveProperty}>Save</button>
                <button className="border rounded px-4 py-2" onClick={() => router.push('/hosting/listings')}>Back to listings</button>
              </div>
            </div>
          </div>
        </div>

        {/* Auctions panel */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Auctions for this property</h3>

          <div className="mb-4">
            <CreateAuctionForm onCreate={(s, e) => createAuction(s, e)} />
          </div>

          <div className="space-y-3">
            {auctions.length === 0 && <div className="text-gray-500">No auctions found for this property.</div>}
            {auctions.map((a) => (
              <div key={a.auction_id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">Auction {a.auction_id}</div>
                  <div className="text-sm text-gray-600">{new Date(a.start_time).toLocaleString()} → {new Date(a.end_time).toLocaleString()}</div>
                  <div className="text-sm">Status: <span className="font-semibold">{a.status}</span></div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded" onClick={() => viewBids(a.auction_id)}>View bids</button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => finalizeAuction(a.auction_id)}>Finalize</button>
                </div>
              </div>
            ))}
          </div>

          {bids && (
            <div className="mt-6 bg-gray-50 p-4 rounded">
              <h4 className="font-semibold">Bids</h4>
              {bids.length === 0 && <div className="text-gray-500">No bids yet.</div>}
              {bids.map((b: any) => (
                <div key={b.bid_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{b.user?.name || b.bidder_id}</div>
                    <div className="text-sm text-gray-600">{new Date(b.bid_time).toLocaleString()}</div>
                  </div>
                  <div className="font-semibold">₫{Number(b.bid_amount).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateAuctionForm({ onCreate }: { onCreate: (start: string, end: string) => void }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
      <div>
        <label className="text-sm">Start</label>
        <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label className="text-sm">End</label>
        <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => onCreate(start, end)}>Create auction</button>
      </div>
    </div>
  );
}
