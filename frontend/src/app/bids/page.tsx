"use client";

import { useEffect, useState, useMemo } from "react";
import { Gavel, CheckCircle, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Header from "@/components/SubHeader";

type UserBid = {
  bid_id: string;
  status: "valid" | "cancelled" | "completed" | "pending";
};

type Auction = {
  auction_id: string;
  property: {
    title: string;
  };
  final_price: number;
  userbid: UserBid[]; // chỉ có 1 phần tử vì backend lọc lại bid thắng
  payment_status?: "paid" | "unpaid";
};

export default function BidsPage() {
  const [filter, setFilter] = useState<"all" | "ongoing" | "cancelled" | "past" | "pending">("all");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWins = async () => {
      try {
        const res = await api.get("/auction/my-wins");
        setAuctions(res.data);
      } catch (err: any) {
        if (err.response) {
          console.error("❌ Response error:", err.response.data);
        } else if (err.request) {
          console.error("❌ No response from server:", err.request);
        } else {
          console.error("❌ Request setup error:", err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWins();
  }, []);

  // helper: map userbid.status → filter status
  const mapBidStatus = (status: UserBid["status"]) => {
    if (status === "valid") return "ongoing";
    if (status === "cancelled") return "cancelled";
    if (status === "pending") return "pending";
    return "past"; // completed
  };

  const filtered = auctions.filter((a) => {
    const bid = a.userbid[0];
    if (!bid) return false;

    const bidStatus = mapBidStatus(bid.status);
    if (filter === "all") return true;
    return filter === bidStatus;
  });

  const statusMeta = (s: ReturnType<typeof mapBidStatus>) => {
    switch (s) {
      case "ongoing":
        return { label: "Ongoing", bg: "bg-blue-50", text: "text-blue-700", icon: Gavel };
      case "pending":
        return { label: "Pending Confirmation", bg: "bg-purple-50", text: "text-purple-700", icon: Clock };
      case "cancelled":
        return { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", icon: XCircle };
      default:
        return { label: "Completed", bg: "bg-gray-100", text: "text-gray-700", icon: CheckCircle };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Gavel className="h-6 w-6 mr-2 text-blue-600" /> My Winning Auctions
        </h1>

        {/* Filter */}
        <div className="mb-6">
          <div className="inline-flex rounded-xl border border-gray-500/40 bg-white p-1 shadow-sm shadow-gray-100">
            {["all", "ongoing", "pending", "cancelled", "past"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f
                    ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "ongoing"
                  ? "Ongoing"
                  : f === "pending"
                  ? "Pending"
                  : f === "cancelled"
                  ? "Cancelled"
                  : "Past"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && <p className="text-gray-600">Loading...</p>}

        {/* Auctions list */}
        <div className="grid gap-4">
          {!loading && filtered.length === 0 && (
            <p className="text-gray-500">No auctions found.</p>
          )}
          {filtered.map((auction) => {
            const bid = auction.userbid[0];
            const bidStatus = mapBidStatus(bid.status);
            const meta = statusMeta(bidStatus);
            const Icon = meta.icon;

            return (
              <div
                key={auction.auction_id}
                className="rounded-2xl border border-gray-500/40 bg-white p-4 md:p-5 shadow-sm hover:shadow-lg hover:ring-1 hover:ring-blue-400/40 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition transform hover:-translate-y-0.5"
              >
                {/* Gradient top bar accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mb-3" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      // Give ongoing a subtle gradient pill; others keep their color for clarity
                      mapBidStatus(bid.status) === "ongoing"
                        ? "bg-gradient-to-r from-blue-600/10 to-blue-400/10 text-blue-700 ring-1 ring-blue-500/20"
                        : `${meta.bg} ${meta.text}`
                    } mb-2`}>
                      <Icon className="w-3.5 h-3.5" /> {meta.label}
                    </div>
                    <h2 className="font-semibold truncate">
                      {auction.property?.title ?? "Untitled Property"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Final price
                    </p>
                    <div className="text-xl font-extrabold text-gray-900">
                      {new Intl.NumberFormat("vi-VN").format(auction.final_price)} đ
                    </div>

                    {auction.payment_status && (
                      <p className="mt-2 text-sm">
                        Payment:{" "}
                        {auction.payment_status === "paid" ? (
                          <span className="text-green-600 font-medium inline-flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium inline-flex items-center">
                            <Clock className="w-4 h-4 mr-1" /> Unpaid
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
                    {(bidStatus === "ongoing" || bidStatus === "pending") ? (
                      <button
                        onClick={() => router.push(`/bids/${bid.bid_id}/payment`)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium shadow-md hover:from-blue-700 hover:to-blue-500 transition"
                      >
                        Pay Deposit
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">No action available</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
