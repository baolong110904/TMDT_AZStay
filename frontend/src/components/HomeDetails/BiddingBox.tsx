"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BiddingBox({
  startPrice,
  currentPrice,
  availableDateStart,
  availableDateEnd,
  biddingStartTime,
  biddingEndTime,
  onConfirmBid,
}: {
  startPrice: number;
  currentPrice: number;
  availableDateStart: Date;
  availableDateEnd: Date;
  biddingStartTime: Date;
  biddingEndTime: Date;
  onConfirmBid: (price: number, dates: [Date, Date]) => void;
}) {
  const [bidAmount, setBidAmount] = useState(currentPrice + 10000);
  const [countdown, setCountdown] = useState("");
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);

  
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
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remaining / (1000 * 60)) % 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
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
        <p>Bidding started at: {biddingStartTime.toLocaleTimeString()}</p>
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
          className="bg-red-500 text-white w-full p-2 rounded hover:bg-red-600 transition"
          disabled={bidAmount <= currentPrice}
          onClick={() => {
            if (selectedDates[0] && selectedDates[1]) {
              onConfirmBid(bidAmount, selectedDates as [Date, Date]);
            } else {
              alert("Please select a valid date range");
            }
          }}
        >
          Confirm Bidding
        </button>
      </div>
    </motion.div>
  );
}
