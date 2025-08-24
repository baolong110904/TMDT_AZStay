"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import Header from "@/components/SubHeader";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const bidId = params?.bidId as string;
  const [loadingVNPay, setLoadingVNPay] = useState(false);
  const [loadingPaypal, setLoadingPaypal] = useState(false);
  const [bidInfo, setBidInfo] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Helpers
  const fromVietnamTime = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return new Date(d.getTime() - 7 * 60 * 60 * 1000);
  };

  const formatVND = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      Math.max(0, Math.round(amount))
    );
  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getNights = () => {
    const start = bidInfo?.stay_start ? fromVietnamTime(bidInfo.stay_start) : null;
    const end = bidInfo?.stay_end ? fromVietnamTime(bidInfo.stay_end) : null;
    if (!start || !end) return 1;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Derived values
  const { nights, pricePerNight, totalVND, depositVND, depositUSD } = useMemo(() => {
    const n = getNights();
    const price = Number(bidInfo?.auction?.final_price || 0);
    const total = price * n;
    const deposit = total * 0.05;
    return {
      nights: n,
      pricePerNight: price,
      totalVND: total,
      depositVND: deposit,
      depositUSD: deposit / 24000, // assume 24k exchange rate
    };
  }, [bidInfo]);

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

  // Fetch cover image for property when we know propertyId
  const computedPropertyId = useMemo(() => {
    return (
      bidInfo?.auction?.property_id ||
      bidInfo?.auction?.property?.property_id ||
      null
    );
  }, [bidInfo]);

  useEffect(() => {
    if (!computedPropertyId) return;
    let cancelled = false;
    (async () => {
      try {
        // Use public property detail endpoint which includes propertyimage[]
        const res = await api.get(`/properties/${computedPropertyId}`);
        const images = res.data?.propertyimage || [];
        const cover = Array.isArray(images)
          ? images.find((img: any) => img?.is_cover) || images[0]
          : null;
        if (!cancelled) setCoverUrl(cover?.image_url || null);
      } catch (err) {
        // Silently ignore and rely on fallback from bidInfo
        if (!cancelled) setCoverUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [computedPropertyId]);

  // Actions
  const handleVNPay = async () => {
    if (!bidInfo) return;
    setLoadingVNPay(true);
    try {
      const res = await api.post(`/payment/vnpay/create-session`, {
        bidId: bidId,
        amount: depositVND,
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
      setLoadingVNPay(false);
    }
  };

  const handlePayPal = async () => {
    if (!bidInfo) return;
    setLoadingPaypal(true);
    try {
      const res = await api.post(`/payment/paypal/create-session`, {
        bidId: bidId,
        amount: depositUSD.toFixed(2),
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

  const propertyImage =
    coverUrl || bidInfo?.auction?.property?.images?.[0]?.url || "/logo2.png";

  return (
    <div className="min-h-screen bg-white">
  {/* Global Header */}
  <Header />

      {/* Page title and back */}
      <div className="mx-auto mt-10 max-w-6xl px-4 pt-2 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-full border p-2 hover:bg-gray-100"
          aria-label="Go back"
        >
          {/* left arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Auction payment</h1>
          <span className="text-sm text-gray-500">Bidding id: #{bidId}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: actions (stacked steps) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Step 1: Choose a payment method */}
          <section className="rounded-2xl border border-gray-500/40 bg-white p-5 shadow-md">
            <h2 className="text-lg font-semibold mb-1">1. Add a payment method</h2>
            <p className="text-sm text-gray-500 mb-4">Pay a 5% deposit now to secure your stay. The remaining balance will be paid later.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleVNPay}
                disabled={loadingVNPay || !bidInfo}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border border-gray-500/40 p-4 text-left transition ${
                  loadingVNPay || !bidInfo ? "opacity-60 cursor-not-allowed" : "hover:border-blue-500 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/vnpay.svg" alt="VNPay" className="h-5 w-auto" />
                    <div className="font-medium">VNPay</div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">Recommended</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{formatVND(depositVND || 0)}</div>
                <div className="text-xs text-gray-500">5% deposit • Total {formatVND(totalVND || 0)}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition group-hover:bg-blue-700">
                  {loadingVNPay ? "Processing..." : "Pay with VNPay"}
                </div>
              </button>

              <button
                onClick={handlePayPal}
                disabled={loadingPaypal || !bidInfo}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border border-gray-500/40 p-4 text-left transition ${
                  loadingPaypal || !bidInfo ? "opacity-60 cursor-not-allowed" : "hover:border-green-500 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/paypal.svg" alt="PayPal" className="h-5 w-auto" />
                    <div className="font-medium">PayPal</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">{formatUSD(Number((depositUSD || 0).toFixed(2)))}</div>
                <div className="text-xs text-gray-500">5% deposit • Total {formatVND(totalVND || 0)}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition group-hover:bg-green-700">
                  {loadingPaypal ? "Processing..." : "Pay with PayPal"}
                </div>
              </button>
            </div>
          </section>

          {/* Step 2: Review & terms */}
          <section className="rounded-2xl border border-gray-500/40 bg-white p-5 shadow-md">
            <h2 className="text-lg font-semibold mb-2">2. Review your request</h2>
            <p className="text-sm text-gray-600">By continuing, you agree to the booking terms and the host's refund policy.</p>
          </section>
        </div>

        {/* Right column: summary card */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-500/40 bg-white p-5 shadow-md sticky top-20">
            {bidInfo ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {/* image */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={propertyImage} alt="Property" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{bidInfo?.auction?.property?.title || "Property"}</div>
                    <div className="text-xs text-gray-500">Winner: {bidInfo?.user?.name || "—"}</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium">{formatDate(bidInfo.stay_start)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium">{formatDate(bidInfo.stay_end)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price/night</span>
                    <span className="font-medium">{pricePerNight ? formatVND(pricePerNight) : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="text-xl font-extrabold text-gray-900">{formatVND(totalVND || 0)}</span>
                  </div>
                </div>

                {/* Highlight deposit */}
                <div className="mt-5 rounded-xl bg-gray-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Deposit (5%)</div>
                  <div className="mt-1 text-3xl font-extrabold text-gray-900">{formatVND(depositVND || 0)}</div>
                  <div className="text-xs text-gray-500">Equivalent to {formatUSD(Number((depositUSD || 0).toFixed(2)))} via PayPal</div>
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-16 w-full rounded-lg bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-4 w-1/2 rounded bg-gray-100" />
                <div className="h-4 w-1/3 rounded bg-gray-100" />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer back to home */}
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <button
          onClick={() => router.push("/home")}
          className="w-full lg:w-auto rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
