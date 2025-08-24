"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type Auction = {
  auction_id: string;
  property_id: string;
  start_time: string;
  end_time: string;
  status?: string | null;
  property?: {
    property_id: string;
    title?: string | null;
    owner_id?: string | null;
  } | null;
};

function decodeJwtSub(): string | null {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.sub || null;
  } catch {
    return null;
  }
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function Progress({ start, end }: { start: string; end: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const st = new Date(start).getTime();
  const et = new Date(end).getTime();
  const total = Math.max(1, et - st);
  const elapsed = Math.min(Math.max(0, now - st), total);
  const pct = Math.round((elapsed / total) * 100);
  const left = Math.max(0, et - now);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>{new Date(start).toLocaleString()}</span>
        <span className="font-medium text-gray-800">{formatDuration(left)} left</span>
        <span>{new Date(end).toLocaleString()}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AuctionManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<"propEnd" | "endingSoon">("propEnd");
  const [endingMap, setEndingMap] = useState<Record<string, boolean>>({});

  const userId = useMemo(() => decodeJwtSub(), []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
  const res = await api.get("auction/active");
  const data: Auction[] = res.data?.data ?? res.data ?? [];
  setAuctions(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const res = await api.get("auction/active");
      const data: Auction[] = res.data?.data ?? res.data ?? [];
      setAuctions(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  }

  async function endAuction(auctionId: string) {
    try {
      setEndingMap((m) => ({ ...m, [auctionId]: true }));
      await api.patch(`auction/${auctionId}/end`, {});
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to end auction");
    } finally {
      setEndingMap((m) => ({ ...m, [auctionId]: false }));
    }
  }

  const mineBase = useMemo(() => {
    const now = Date.now();
    const isInWindow = (a: Auction) => {
      const st = new Date(a.start_time).getTime();
      const et = new Date(a.end_time).getTime();
      return now >= st && now <= et;
    };
    // If userId not available, show nothing (respect the spec: show for this user)
    if (!userId) return [] as Auction[];
    // Filter by owner and time window client-side to work regardless of backend status flag logic
    const filtered = (auctions || [])
      .filter((a) => String(a.property?.owner_id) === String(userId))
      .filter(isInWindow)
      .filter((a) => (a.status || "active") !== "ended");
    // Default sort: property_id (asc) then end_time (desc - newest first)
    return [...filtered].sort((a, b) => {
      const byProp = String(a.property_id).localeCompare(String(b.property_id));
      if (byProp !== 0) return byProp;
      const be = new Date(b.end_time).getTime();
      const ae = new Date(a.end_time).getTime();
      return be - ae;
    });
  }, [auctions, userId]);

  const mine = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mineBase;
    if (q) {
      list = list.filter((a) =>
        [a.property?.title, a.property_id, a.auction_id]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(q))
      );
    }
    if (sortMode === "endingSoon") {
      list = [...list].sort(
        (a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime()
      );
    }
    return list;
  }, [mineBase, query, sortMode]);

  const grouped = useMemo(() => {
    const map = new Map<string, { propertyId: string; title?: string | null; items: Auction[] }>();
    for (const a of mine) {
      const key = String(a.property_id);
      const entry = map.get(key) || { propertyId: key, title: a.property?.title, items: [] };
      entry.items.push(a);
      if (!entry.title && a.property?.title) entry.title = a.property.title;
      map.set(key, entry);
    }
    return Array.from(map.values());
  }, [mine]);

  return (
    <div className="min-h-[90vh] bg-white">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by property or auction ID"
              className="w-64 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="propEnd">Group by property · Newest end on top</option>
              <option value="endingSoon">Ending soon</option>
            </select>
            <button
              className="text-sm text-gray-600 hover:underline"
              onClick={() => {
                const dest = userId
                  ? `/hosting/listings?userId=${encodeURIComponent(String(userId))}`
                  : "/hosting/listings";
                router.push(dest);
              }}
            >
              Back to listings
            </button>
          </div>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {loading && <div className="mt-3 text-sm text-gray-600">Loading…</div>}

        {!loading && !userId && (
          <div className="mt-6 text-gray-700">Please log in to see your active auctions.</div>
        )}

        {!loading && userId && mine.length === 0 && (
          <div className="mt-6 text-gray-700">No active auctions for your listings.</div>
        )}

        {!loading && userId && grouped.length > 0 && (
          <div className="mt-6 space-y-8">
            {grouped.map((g) => (
              <section key={g.propertyId}>
                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Property</div>
                  <div className="text-lg font-semibold text-gray-900">{g.title || g.propertyId}</div>
                  <div className="text-xs text-gray-500">{g.items.length} active auction{g.items.length > 1 ? "s" : ""}</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                  {g.items.map((a) => (
                    <div key={a.auction_id} className="relative mb-4 last:mb-0">
                      <div className="absolute -left-0.5 top-4 h-3 w-3 rounded-full bg-indigo-600 ring-2 ring-white" />
                      <div className="ml-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-xs text-gray-500">Auction</div>
                            <div className="text-sm font-medium text-gray-900">{a.auction_id}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs rounded-full bg-indigo-50 text-indigo-700 px-2 py-1 border border-indigo-200">active</span>
                            <button
                              className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black"
                              onClick={() => router.push(`/edit-room/${a.property_id}/auction/${a.auction_id}`)}
                            >
                              Open monitor
                            </button>
                            <button
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                              disabled={!!endingMap[a.auction_id]}
                              onClick={() => endAuction(a.auction_id)}
                            >
                              {endingMap[a.auction_id] ? "Ending…" : "End auction"}
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress start={a.start_time} end={a.end_time} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
