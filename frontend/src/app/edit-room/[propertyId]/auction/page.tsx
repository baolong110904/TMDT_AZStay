"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

type Auction = {
  auction_id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "ended";
  final_price?: number | null;
  winner_id?: string | null;
  user?: { name?: string; full_name?: string; email?: string } | null;
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
// Removed bids UI and logic on this page; bidding/testing is handled on the specific auction monitor page
// (/edit-room/[propertyId]/auction/[auctionId]).
export default function AuctionPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = (params as any)?.propertyId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [start, setStart] = useState<string>(defaultStart());
  const [end, setEnd] = useState<string>(defaultEnd());
  const [creating, setCreating] = useState(false);

  // Active auction for this property
  const [activeAuction, setActiveAuction] = useState<Auction | null>(null);

  // Bids/test bid removed from this page
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    refreshActive();
  }, [propertyId]);

  // No bids fetching on this page; use the per-auction monitor page instead

  // Runtime status by time window only
  const runtimeStatus: 'active' | 'upcoming' | 'ended' | 'unknown' = useMemo(() => {
    if (!activeAuction) return 'unknown';
    // If backend already marked ended, trust that first
    if (activeAuction.status === 'ended') return 'ended';
    const now = Date.now();
    const st = new Date(activeAuction.start_time).getTime();
    const et = new Date(activeAuction.end_time).getTime();
    if (now < st) return 'upcoming';
    if (now >= st && now <= et) return 'active';
    return 'ended';
  }, [activeAuction]);
  const canEnd = useMemo(() => {
    if (!activeAuction) return false;
    // Allow finalizing only after the scheduled end time and if not already marked ended
    if (activeAuction.status === 'ended') return false;
    const now = Date.now();
    const et = new Date(activeAuction.end_time).getTime();
    return now > et;
  }, [activeAuction]);

  // Removed available stay window, bids list, and minAllowedBid logic

  async function refreshActive() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("auction/active");
      const list: Auction[] = res.data?.data ?? res.data ?? [];
      const a = (list || []).find((x) => String(x.property_id) === String(propertyId)) || null;
      if (a) {
        setActiveAuction(a);
      } else {
        // Fallback: use last created (stored locally) so host can see scheduled auction
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem(`lastAuction:${propertyId}`) : null;
          if (raw) {
            const cached = JSON.parse(raw) as Auction;
            // only show if not yet ended
            if (new Date(cached.end_time).getTime() > Date.now()) {
              setActiveAuction(cached);
            } else {
              setActiveAuction(null);
            }
          } else {
            setActiveAuction(null);
          }
        } catch {
          setActiveAuction(null);
        }
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  }

  async function createAuction() {
    if (!propertyId) return;
    try {
      setCreating(true);
      setError(null);
      const res = await api.post("auction", {
        property_id: propertyId,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
      });
      const created: Auction = res.data?.data ?? res.data;
      setActiveAuction(created);
      // persist so refreshActive can show it even if not yet in /auction/active
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`lastAuction:${propertyId}`, JSON.stringify(created));
        }
      } catch {}
      // Navigate to monitor page for this specific auction
      if ((created as any)?.auction_id) {
        router.push(`/edit-room/${propertyId}/auction/${created.auction_id}`);
        return;
      }
      await refreshActive();
      window.alert("Auction created");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to create auction");
    } finally {
      setCreating(false);
    }
  }

  // Removed placeBid logic; use the per-auction monitor page to place bids

  function openMonitor() {
    if (!activeAuction?.auction_id) return;
    router.push(`/edit-room/${propertyId}/auction/${activeAuction.auction_id}`);
  }

  async function endAuction(auctionId: string) {
    try {
      setEnding(true);
      setError(null);
  const res = await api.patch(`auction/${auctionId}/end`, {});
  const updated: Auction = res.data?.data ?? res.data;
  // Keep showing the just-ended auction with winner info
  setActiveAuction(updated);
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
            <div
              className="mt-3 rounded-2xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:ring-1 hover:ring-gray-200 focus:outline-none"
              role="button"
              tabIndex={0}
              onClick={openMonitor}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openMonitor();
              }}
            >
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
                  <div className="text-gray-900 text-lg">{activeAuction!.final_price != null ? `₫${Number(activeAuction!.final_price).toLocaleString()}` : "—"}</div>
                </div>
                <div>
                  <div className="text-gray-800 font-medium">Status</div>
                  <div className="text-gray-600 text-sm capitalize">{runtimeStatus}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      endAuction(activeAuction!.auction_id);
                    }}
                    disabled={ending || !canEnd}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      ending || !canEnd
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
                    }`}
                  >
                    {ending ? "Ending…" : "Finalize auction"}
                  </button>
                  {!canEnd && activeAuction?.status !== 'ended' && (
                    <span className="text-xs text-gray-500">You can finalize after the end time.</span>
                  )}
                </div>
              </div>

              {runtimeStatus === 'ended' && (
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-3">
                  <div className="text-green-800 text-sm font-semibold">Auction ended</div>
                  <div className="mt-1 text-sm text-green-900">
                    Final price: {activeAuction!.final_price != null ? `₫${Number(activeAuction!.final_price).toLocaleString()}` : '—'}
                  </div>
                  <div className="text-sm text-green-900">
                    Winner: {activeAuction!.user?.full_name || activeAuction!.user?.name || activeAuction!.user?.email || activeAuction!.winner_id || '—'}
                  </div>
                </div>
              )}

              {/* Bids and test bidding are handled on the per-auction monitor page */}
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
