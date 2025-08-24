"use client";

import { useEffect, useState } from "react";
import { Gavel, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Gavel className="h-6 w-6 mr-2 text-gray-600" /> My Winning Auctions
      </h1>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        {["all", "ongoing", "pending", "cancelled", "past"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg border ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
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

      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Auctions list */}
      <div className="grid gap-4">
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">No auctions found.</p>
        )}
        {filtered.map((auction) => {
          const bid = auction.userbid[0];
          const bidStatus = mapBidStatus(bid.status);

          return (
            <div
              key={auction.auction_id}
              className="border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
            >
              <div>
                <h2 className="font-semibold">
                  {auction.property?.title ?? "Untitled Property"}
                </h2>
                <p className="text-sm text-gray-500">
                  Final Price:{" "}
                  {new Intl.NumberFormat("vi-VN").format(auction.final_price)} đ
                </p>
                <p className="text-sm">
                  Status:{" "}
                  {bidStatus === "ongoing" ? (
                    <span className="text-blue-600 font-medium">Ongoing</span>
                  ) : bidStatus === "pending" ? (
                    <span className="text-purple-600 font-medium">Pending Confirmation</span>
                  ) : bidStatus === "cancelled" ? (
                    <span className="text-red-600 font-medium">Cancelled</span>
                  ) : (
                    <span className="text-gray-600 font-medium">Past</span>
                  )}
                </p>

                {auction.payment_status && (
                  <p className="text-sm">
                    Payment:{" "}
                    {auction.payment_status === "paid" ? (
                      <span className="text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Paid
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> Unpaid
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* 👉 Chỉ hiện Pay Deposit khi ongoing (pending thì ẩn) */}
              {bidStatus === "ongoing" && (
                <button
                  onClick={() => router.push(`/bids/${bid.bid_id}/payment`)}
                  className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Pay Deposit
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
