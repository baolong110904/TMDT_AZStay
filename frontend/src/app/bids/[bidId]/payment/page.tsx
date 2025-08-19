"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const bidId = params?.bidId as string;
  const [loading, setLoading] = useState(false);
  const [loadingPaypal, setLoadingPaypal] = useState(false);
  const [bidInfo, setBidInfo] = useState<any>(null);

  const fromVietnamTime = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return new Date(d.getTime() - 7 * 60 * 60 * 1000);
  };
  
  const getNights = () => {
    const start = bidInfo?.stay_start ? fromVietnamTime(bidInfo.stay_start) : null;
    const end = bidInfo?.stay_end ? fromVietnamTime(bidInfo.stay_end) : null;
    if (!start || !end) return 1;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    if (!bidId) return;
    async function fetchBid() {
      try {
        const res = await api.get(`/bids/${bidId}`);
        setBidInfo(res.data);
      } catch (err: any) {
        console.error("Error loading bid info:", err);
      }
    }
    fetchBid();
  }, [bidId]);

  const handleVNPay = async () => {
    if (!bidInfo) return;
    setLoading(true);
    try {
      const nights = getNights();
      const totalAmount = (bidInfo.auction.final_price || 0) * nights;
      const depositAmount = 0.05 * totalAmount;

      const res = await api.post(`/payment/vnpay/create-session`, {
        bidId: bidId,
        amount: depositAmount,
      });

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert("Unable to create VNPay link!");
      }
    } catch (err) {
      console.error("VNPay error:", err);
      alert("VNPay payment failed!");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPal = async () => {
    if (!bidInfo) return;
    setLoadingPaypal(true);
    try {
      const nights = getNights();
      const totalAmount = (bidInfo.auction.final_price || 0) * nights;
      const depositAmount = (0.05 * totalAmount) / 24000; // giả sử convert VND→USD tỉ giá 24k

      const res = await api.post(`/payment/paypal/create-session`, {
        bidId: bidId,
        amount: depositAmount.toFixed(2),
      });

      if (res.data?.approvalUrl) {
        window.location.href = res.data.approvalUrl;
      } else {
        alert("Unable to create PayPal link!");
      }
    } catch (err) {
      console.error("PayPal error:", err);
      alert("PayPal payment failed!");
    } finally {
      setLoadingPaypal(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not available";
    const date = fromVietnamTime(dateStr);
    return date?.toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Auction Payment #{bidId}</h1>

      {bidInfo ? (
        <div className="bg-white shadow rounded-xl p-6 w-full max-w-md">
          <p className="mb-2">
            <span className="font-semibold">Property:</span>{" "}
            {bidInfo?.auction?.property?.title || "Not available"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Winner:</span>{" "}
            {bidInfo?.user?.name || "Not available"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Stay Start:</span>{" "}
            {formatDate(bidInfo.stay_start)}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Stay End:</span>{" "}
            {formatDate(bidInfo.stay_end)}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Number of Nights:</span> {getNights()}
          </p>
          <p className="mb-2">
              <span className="font-semibold">Price per Night:</span>{" "}
              {bidInfo?.auction?.final_price
                ? Number(bidInfo.auction.final_price).toLocaleString()
                : "Not available"}{" "}
              VND
          </p>
          <p className="mb-2">
            <span className="font-semibold">Total Price:</span>{" "}
            {bidInfo?.auction?.final_price
              ? (bidInfo.auction.final_price * getNights()).toLocaleString()
              : "Not available"}{" "}
            VND
          </p>
          <p className="mb-2">
            <span className="font-semibold">Deposit (5%):</span>{" "}
            {bidInfo?.auction?.final_price
              ? ((bidInfo.auction.final_price * getNights()) * 0.05).toLocaleString()
              : "Not available"}{" "}
            VND
          </p>

          {/* Hai nút thanh toán */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleVNPay}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Pay with VNPay"}
            </button>

            <button
              onClick={handlePayPal}
              disabled={loadingPaypal}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                loadingPaypal ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingPaypal ? "Processing..." : "Pay with PayPal"}
            </button>
          </div>
        </div>
      ) : (
        <p>Loading auction information...</p>
      )}

      <button
        onClick={() => router.push("/home")}
        className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        Back to Home
      </button>
    </div>
  );
}
