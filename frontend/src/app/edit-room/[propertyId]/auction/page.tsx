"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

type Auction = {
  auction_id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "ended";
  final_price?: number | null;
  winner_id?: string | null;
  property?: any;
};

type Bid = {
  bid_id: string;
  auction_id: string;
  bidder_id: string;
  bid_amount: number;
  bid_time?: string;
  user?: { full_name?: string; email?: string };
};

export default function AuctionPage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [start, setStart] = useState<string>(defaultStart());
  const [end, setEnd] = useState<string>(defaultEnd());
  const [creating, setCreating] = useState(false);

  // Active auction for this property
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);

  // Bids
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);

  // Try bid (for testing)
  const [bidAmount, setBidAmount] = useState<string>("");
  const [stayStart, setStayStart] = useState<string>(defaultStart());
  const [stayEnd, setStayEnd] = useState<string>(defaultEnd());
  const [placing, setPlacing] = useState(false);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    refreshActive();
  }, [propertyId]);

  useEffect(() => {
    if (!activeAuction?.auction_id) {
      setBids([]);
      return;
    }
    fetchBids(activeAuction.auction_id);
  }, [activeAuction?.auction_id]);

  async function refreshActive() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("auction/active");
      const list: Auction[] = res.data?.data ?? res.data ?? [];
      const a = (list || []).find((x) => String(x.property_id) === String(propertyId)) || null;
      setActiveAuction(a);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBids(auctionId: string) {
    try {
      setBidsLoading(true);
      const res = await api.get(`auction/${auctionId}/bids`);
      const data: Bid[] = res.data?.data ?? res.data ?? [];
      setBids(data);
    } catch (e) {
      // ignore for now
    } finally {
      setBidsLoading(false);
    }
  }

  async function createAuction() {
    if (!propertyId) return;
    try {
      setCreating(true);
      setError(null);
      await api.post("auction", {
        property_id: propertyId,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      });
      await refreshActive();
      window.alert("Auction created");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to create auction");
    } finally {
      setCreating(false);
    }
  }

  async function placeBid(auctionId: string) {
    try {
      setPlacing(true);
      setError(null);
      await api.post(`auction/${auctionId}/bid`, {
        bid_amount: Number(bidAmount),
        stay_start: new Date(stayStart).toISOString(),
        stay_end: new Date(stayEnd).toISOString(),
      });
      await fetchBids(auctionId);
      await refreshActive();
      setBidAmount("");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to place bid");
    } finally {
      setPlacing(false);
    }
  }

  async function endAuction(auctionId: string) {
    try {
      setEnding(true);
      setError(null);
      await api.patch(`auction/${auctionId}/end`, {});
      await refreshActive();
      window.alert("Auction ended");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to end auction");
    } finally {
      setEnding(false);
    }
  }

  const hasActive = !!activeAuction;

  return (
    <div className="min-h-[90vh] bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Auction</h1>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && (
          <div className="mt-2 text-gray-500 text-sm">Loading…</div>
        )}

        {/* Create section */}
        <section className="mt-8">
          <div className="text-sm font-semibold text-gray-800">Create an auction</div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledInput
              label="Start"
              type="datetime-local"
              value={start}
              onChange={setStart}
            />
            <LabeledInput
              label="End"
              type="datetime-local"
              value={end}
              onChange={setEnd}
            />
          </div>
          <div className="mt-4">
            <button
              onClick={createAuction}
              disabled={creating}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                creating
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
              }`}
            >
              {creating ? "Creating…" : "Create auction"}
            </button>
          </div>
        </section>

        {/* Active auction */}
        <section className="mt-10">
          <div className="text-sm font-semibold text-gray-800">Active auction</div>
          {!hasActive ? (
            <div className="mt-3 text-gray-600 text-sm">No active auction for this listing. Create one above.</div>
          ) : (
            <div className="mt-3 rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-gray-800 font-medium">Auction ID</div>
                  <div className="text-gray-600 text-sm">{activeAuction!.auction_id}</div>
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Ends</div>
                  <div className="text-gray-600 text-sm">{fmt(activeAuction!.end_time)}</div>
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Current price</div>
                  <div className="text-gray-900 text-lg">{activeAuction!.final_price ? `₫${Number(activeAuction!.final_price).toLocaleString()}` : "—"}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => endAuction(activeAuction!.auction_id)}
                    disabled={ending}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      ending
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
                    }`}
                  >
                    {ending ? "Ending…" : "End auction"}
                  </button>
                </div>
              </div>

              {/* Bids */}
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-800">Bids</div>
                {bidsLoading ? (
                  <div className="mt-2 text-gray-600 text-sm">Loading bids…</div>
                ) : bids.length === 0 ? (
                  <div className="mt-2 text-gray-600 text-sm">No bids yet.</div>
                ) : (
                  <ul className="mt-2 divide-y divide-gray-100">
                    {bids.map((b) => (
                      <li key={b.bid_id} className="py-2 flex items-center justify-between text-sm">
                        <div className="text-gray-700">
                          <span className="font-medium">{b.user?.full_name || b.bidder_id}</span>
                          <span className="text-gray-400"> · </span>
                          <span>{fmt(b.bid_time)}</span>
                        </div>
                        <div className="text-gray-900 font-semibold">₫{Number(b.bid_amount).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Try bid */}
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-800">Place a test bid</div>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <LabeledInput label="Amount" value={bidAmount} onChange={setBidAmount} placeholder="1000000" />
                  <LabeledInput label="Stay start" type="datetime-local" value={stayStart} onChange={setStayStart} />
                  <LabeledInput label="Stay end" type="datetime-local" value={stayEnd} onChange={setStayEnd} />
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => placeBid(activeAuction!.auction_id)}
                    disabled={placing || !bidAmount}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      placing || !bidAmount
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
                    }`}
                  >
                    {placing ? "Placing…" : "Place bid"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer save spacing for consistency */}
        <div className="mt-60" />
      </div>
    </div>
  );
}

function fmt(v?: string | number | Date | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString();
}

function defaultStart() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 5);
  return toLocalInput(d);
}
function defaultEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalInput(d);
}
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}
