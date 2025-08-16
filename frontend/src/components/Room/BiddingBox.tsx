"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/lib/axios";
import { io } from "socket.io-client";

let socket: any;

export default function BiddingBox({
  startPrice,
  currentPrice: initialPrice,
  availableDateStart,
  availableDateEnd,
  biddingStartTime,
  biddingEndTime,
  auctionId,
}: {
  startPrice: number;
  currentPrice: number;
  availableDateStart: Date;
  availableDateEnd: Date;
  biddingStartTime: Date;
  biddingEndTime: Date;
  auctionId: string;
}) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidAmount, setBidAmount] = useState(initialPrice + 10000);
  const [countdown, setCountdown] = useState("");
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);

  // 🔌 Kết nối socket
  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      withCredentials: true,
    });

    // Join vào room theo auctionId
    socket.emit("join-auction", auctionId);

    // Lắng nghe event new-bid
    socket.on("new-bid", (data: any) => {
      if (data.auctionId === auctionId) {
        console.log("📡 New bid received:", data);
        setCurrentPrice(data.bid_amount);
        setBidAmount(data.bid_amount + 10000); // auto gợi ý số tiếp theo
      }
    });

    return () => {
      socket.emit("leave-auction", auctionId);
      socket.disconnect();
    };
  }, [auctionId]);

  const handleConfirmBid = async () => {
    if (!selectedDates[0] || !selectedDates[1]) {
      alert("Please select a valid date range");
      return;
    }
    try {
      await api.post(`/auction/${auctionId}/bid`, {
        bid_amount: bidAmount,
        stay_start: selectedDates[0],
        stay_end: selectedDates[1],
      });
      alert("✅ Bid placed successfully!");
    } catch (err: any) {
      console.error("❌ Failed to place bid:", err);
      alert(err.response?.data?.message || "Failed to place bid");
    }
  };

  // Countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = biddingEndTime.getTime() - now.getTime();
      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown("Bidding ended");
        return;
      }
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [biddingEndTime]);

  return (
    <motion.div
      className="p-6 shadow-2xl rounded-xl sticky top-35 bg-white space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold">Bidding Info</h2>

      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select your stay:
        </label>

        <p className="text-sm text-gray-500">
          Available time: {availableDateStart.toDateString()} – {availableDateEnd.toDateString()}
        </p>

        <DatePicker
          selectsRange
          startDate={selectedDates[0]}
          endDate={selectedDates[1]}
          onChange={(update) => setSelectedDates(update)}
          className="w-full p-2 border border-gray-400 rounded"
          minDate={availableDateStart}
          maxDate={availableDateEnd}
          placeholderText="Select date range"
        />
      </div>

      {/* Price Info */}
      <div className="text-sm">
        <p>
          Start Price:{" "}
          <span className="font-semibold">
            {startPrice.toLocaleString()} VND
          </span>
        </p>
        <p>
          Current Price:{" "}
          <span className="font-semibold text-red-600">
            {currentPrice.toLocaleString()} VND
          </span>
        </p>
      </div>

      {/* Time Info */}
      <div className="text-sm">
        <p>
          Bidding started at:{" "}
          {biddingStartTime.toLocaleDateString()} {biddingStartTime.toLocaleTimeString()}
        </p>
        <p>
          Ends in: <span className="font-semibold">{countdown}</span>
        </p>
      </div>

      {/* Place a bid */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Your Bid (must be higher):
        </label>
        <input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          className="w-full p-2 border border-gray-400 rounded"
          min={currentPrice + 10000}
        />
        <button
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 transition"
          disabled={bidAmount <= currentPrice}
          onClick={handleConfirmBid}
        >
          Confirm Bidding
        </button>
      </div>
    </motion.div>
  );
}
