"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { io as socketIO, Socket } from "socket.io-client";

type Auction = {
  auction_id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  status: "upcoming" | "active" | "ended" | string;
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
  stay_start?: string;
  stay_end?: string;
  user?: { full_name?: string; name?: string; email?: string };
  status?: string;
};

export default function AuctionMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.propertyId as string;
  const auctionId = params?.auctionId as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  // test bid state
  const [bidAmount, setBidAmount] = useState<string>("");
  const [stayStart, setStayStart] = useState<string>(defaultStart());
  const [stayEnd, setStayEnd] = useState<string>(defaultEnd());
  const [placing, setPlacing] = useState(false);

  // computed
  const highestBid: Bid | null = useMemo(() => {
    if (!bids?.length) return null;
    return [...bids].sort((a, b) => Number(b.bid_amount) - Number(a.bid_amount))[0] || null;
  }, [bids]);

  const runtimeStatus: "active" | "upcoming" | "ended" | "unknown" = useMemo(() => {
    if (!auction) return "unknown";
    if (auction.status === "ended") return "ended";
    const now = Date.now();
    const st = new Date(auction.start_time).getTime();
    const et = new Date(auction.end_time).getTime();
    if (now < st) return "upcoming";
    if (now >= st && now <= et) return "active";
    return "ended";
  }, [auction]);

  // Available stay window from backend if included
  const availableStart = useMemo(() => {
    const v = (auction as any)?.property?.checkin_date;
    return v ? new Date(v) : null;
  }, [auction]);
  const availableEnd = useMemo(() => {
    const v = (auction as any)?.property?.checkout_date;
    return v ? new Date(v) : null;
  }, [auction]);

  const minAllowedBid = useMemo(() => {
    const highest = highestBid?.bid_amount != null ? Number(highestBid.bid_amount) : null;
    if (highest != null && !Number.isNaN(highest)) return highest + 10000;
    const base = auction?.final_price != null ? Number(auction.final_price) : 0;
    return base;
  }, [highestBid, auction?.final_price]);

  useEffect(() => {
    if (minAllowedBid != null && Number.isFinite(minAllowedBid as any)) {
      setBidAmount(String(minAllowedBid));
    }
  }, [minAllowedBid]);

  useEffect(() => {
    if (!auctionId) return;
    let socket: Socket | null = null;
    (async () => {
      try {
        setLoading(true);
        await refreshAuction();
        await refreshBids();

        // Join socket room for live updates
        try {
          socket = socketIO(process.env.NEXT_PUBLIC_API_URL as string, {
            withCredentials: true,
          });
          socket.emit("join-auction", auctionId);
          socket.on("new-bid", (data: any) => {
            if (data?.auctionId !== auctionId) return;
            // simply refetch bids for accuracy
            refreshBids();
          });
        } catch (e) {
          // socket optional; ignore failure
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load auction");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      try {
        socket?.emit("leave-auction", auctionId);
        socket?.disconnect();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId]);

  async function refreshAuction() {
    // There isn't a direct GET auction/:id, so use active list + local cache fallback
    const res = await api.get("auction/active");
    const actives: Auction[] = res.data?.data ?? res.data ?? [];
    const found = (actives || []).find((x) => x.auction_id === auctionId) || null;
    if (found) {
      setAuction(found);
      return;
    }
    // fallback from local cache created at creation time
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(`lastAuction:${propertyId}`) : null;
      if (raw) {
        const cached = JSON.parse(raw) as Auction;
        if (cached?.auction_id === auctionId) {
          setAuction(cached);
          return;
        }
      }
    } catch {}
    // final fallback: infer ended auction by checking my-wins list (host side may not be the winner)
    setAuction(null);
  }

  async function refreshBids() {
    try {
      const res = await api.get(`auction/${auctionId}/bids`);
      const data: Bid[] = res.data?.data ?? res.data ?? [];
      setBids(data);
    } catch (e) {
      // ignore for now
    }
  }

  async function placeBid() {
    try {
      setPlacing(true);
      setError(null);

      if (!auction) {
        setError("No auction loaded");
        return;
      }
      const now = new Date();
      const st = new Date(auction.start_time);
      const et = new Date(auction.end_time);
      if (now < st) {
        setError("Auction has not started yet.");
        return;
      }
      if (now > et) {
        setError("Auction has already ended.");
        return;
      }
      const ss = new Date(stayStart);
      const se = new Date(stayEnd);
      if (isNaN(ss.getTime()) || isNaN(se.getTime()) || ss >= se) {
        setError("Invalid stay date range.");
        return;
      }
      if (availableStart && ss < availableStart) {
        setError("Stay start must be within the available period.");
        return;
      }
      if (availableEnd && se > availableEnd) {
        setError("Stay end must be within the available period.");
        return;
      }
      const amount = Number(bidAmount);
      if (Number.isNaN(amount)) {
        setError("Bid amount must be a number.");
        return;
      }
      if (amount < (minAllowedBid as number)) {
        setError(`Bid amount must be at least ${(minAllowedBid as number).toLocaleString()}.`);
        return;
      }

      const res = await api.post(`auction/${auctionId}/bid`, {
        bid_amount: amount,
        stay_start: ss.toISOString(),
        stay_end: se.toISOString(),
      });

      // Optimistic price update
      const newPrice = res?.data?.bid_amount ? Number(res.data.bid_amount) : amount;
      setAuction((prev) => (prev ? { ...prev, final_price: newPrice } : prev));
      await refreshBids();
      setBidAmount("");
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e.message || "Failed to place bid");
    } finally {
      setPlacing(false);
    }
  }

  async function confirm() {
    if (!auction) return;
    try {
      setFinalizing(true);
      setError(null);
      // We use backend finalization endpoint to select highest bid as winner and mark auction ended
      const res = await api.patch(`auction/${auctionId}/end`, {});
      const updated: Auction = res.data?.data ?? res.data;
      setAuction(updated || { ...auction, status: "ended" });
      await refreshBids();
      // Optional: navigate back to property auctions list
      // router.replace(`/edit-room/${propertyId}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to finalize auction");
    } finally {
      setFinalizing(false);
    }
  }

  function deny() {
    // No backend API to cancel an auction or update bid status -> mark locally and inform the host
    setCancelled(true);
  }

  const winnerPaymentLink = useMemo(() => {
    if (!highestBid) return null;
    return `/bids/${highestBid.bid_id}/payment`;
  }, [highestBid]);

  return (
    <div className="min-h-[90vh] bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Auction monitor</h1>
          <button
            className="text-sm text-gray-600 hover:underline"
            onClick={() => router.push(`/edit-room/${propertyId}/photo`)}
          >
            Back to listing
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && <div className="mt-3 text-sm text-gray-600">Loading…</div>}

        {auction ? (
          <div className="mt-6 rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Auction ID" value={auction.auction_id} />
              <Info label="Starts" value={fmt(auction.start_time)} />
              <Info label="Ends" value={fmt(auction.end_time)} />
              <Info label="Status" value={(cancelled ? "cancelled" : runtimeStatus).toString()} />
            </div>

            {/* Highest bid card */}
            <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-800">Highest bid</div>
              {!highestBid ? (
                <div className="mt-2 text-sm text-gray-600">No bids yet.</div>
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-semibold text-lg">₫{Number(highestBid.bid_amount).toLocaleString()}</div>
                    <div className="text-gray-600 text-sm">
                      {highestBid.user?.full_name || highestBid.user?.name || highestBid.user?.email || highestBid.bidder_id}
                      <span className="text-gray-400"> · </span>
                      {fmt(highestBid.bid_time)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirm}
                      disabled={finalizing || runtimeStatus !== "ended" || cancelled}
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        finalizing || runtimeStatus !== "ended" || cancelled
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {finalizing ? "Finalizing…" : "Confirm"}
                    </button>
                    <button
                      onClick={deny}
                      disabled={finalizing || auction.status === "ended"}
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                        finalizing || auction.status === "ended"
                          ? "bg-rose-300 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                Note: Confirm will finalize the auction on the server. Deny is tracked locally because the current API has no cancel endpoint. If you need a true cancel, we can add a minimal backend route.
              </div>

              {auction.status === "ended" && highestBid && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-emerald-800 text-sm font-semibold">Auction finalized</div>
                  <div className="text-sm text-emerald-900 mt-1">
                    Winner: {highestBid.user?.full_name || highestBid.user?.name || highestBid.user?.email || highestBid.bidder_id}
                  </div>
                  <div className="text-sm text-emerald-900">Final price: ₫{Number(highestBid.bid_amount).toLocaleString()}</div>
                  {winnerPaymentLink && (
                    <button
                      onClick={() => router.push(winnerPaymentLink)}
                      className="mt-2 inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-white text-xs font-semibold hover:bg-indigo-700"
                    >
                      Open deposit page for winner
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bids timeline */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-gray-800">All bids</div>
              {bids.length === 0 ? (
                <div className="mt-2 text-sm text-gray-600">No bids yet.</div>
              ) : (
                <ul className="mt-2 divide-y divide-gray-100">
                  {bids.map((b) => (
                    <li key={b.bid_id} className="py-2 flex items-center justify-between text-sm">
                      <div className="text-gray-700">
                        <span className="font-medium">{b.user?.full_name || b.user?.name || b.bidder_id}</span>
                        <span className="text-gray-400"> · </span>
                        <span>{fmt(b.bid_time)}</span>
                      </div>
                      <div className="text-gray-900 font-semibold">₫{Number(b.bid_amount).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Place a test bid */}
            {/* {runtimeStatus === "active" && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-800">Place a test bid</div>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Amount{Number.isFinite(minAllowedBid as any) ? ` (min ${(minAllowedBid as number).toLocaleString()})` : ''}
                    </label>
                    <input
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      type="number"
                      placeholder="1000000"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Stay start</label>
                    <input
                      value={stayStart}
                      onChange={(e) => setStayStart(e.target.value)}
                      type="datetime-local"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Stay end</label>
                    <input
                      value={stayEnd}
                      onChange={(e) => setStayEnd(e.target.value)}
                      type="datetime-local"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={placeBid}
                    disabled={placing || !bidAmount}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                      placing || !bidAmount
                        ? "bg-indigo-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
                    }`}
                  >
                    {placing ? "Placing…" : "Place bid"}
                  </button>
                  {availableStart && availableEnd && (
                    <div className="mt-2 text-xs text-gray-500">
                      Stay must be between {fmt(availableStart)} and {fmt(availableEnd)}
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </div>
        ) : (
          !loading && <div className="mt-6 text-sm text-gray-600">Auction not found.</div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-gray-800 font-medium text-sm">{label}</div>
      <div className="text-gray-600 text-sm">{value != null ? String(value) : "—"}</div>
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
