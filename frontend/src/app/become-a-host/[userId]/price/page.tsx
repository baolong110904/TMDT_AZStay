"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useHostFlow } from "@/components/HostFlowProvider";

export default function PricePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>(""); 
  const propertyId = searchParams?.get("property_id");

  const totalSteps = 7;
  const currentStep = 7;

  const [price, setPrice] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [checkinDate, setCheckinDate] = useState<string>(() => defaultDate(1));
  const [checkoutDate, setCheckoutDate] = useState<string>(() => defaultDate(4));

  const { setCanProceed, setNav } = useHostFlow();
  const { setOnNext } = useHostFlow() as any;

  // 🆕 Lấy user_id từ localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed?.user_id) {
          setUserId(parsed.user_id);
        }
      }
    } catch (err) {
      console.error("❌ Failed to parse user from localStorage:", err);
    }
  }, []);

  console.log("user", userId);

  useEffect(() => {
  // final next should go to hosting listings when flow completes
  setNav({ next: `/hosting/listings?userId=${encodeURIComponent(String(userId))}`, prev: `/become-a-host/${userId}/photo`, currentStep, totalSteps });
    const p = Number(price.replace(/[^0-9.-]/g, "")) || 0;
    const validDates = !!checkinDate && !!checkoutDate && new Date(checkinDate) < new Date(checkoutDate);
    setCanProceed(p > 0 && validDates);
    setOnNext(() => handleSave);
    return () => setOnNext(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, userId, propertyId, checkinDate, checkoutDate, setCanProceed, setNav, setOnNext]);

  const formatCurrency = (v: string) => {
    try {
      const n = Number(v.replace(/[^0-9.-]/g, "")) || 0;
      return n.toLocaleString();
    } catch {
      return v;
    }
  };

  const handleSave = async () => {
    try {
      if (!propertyId) {
        alert("No property_id provided in query. The data will not be saved to backend.");
        return;
      }
      if (!checkinDate || !checkoutDate || new Date(checkinDate) >= new Date(checkoutDate)) {
        alert("Please choose a valid check-in and check-out date (check-out must be after check-in).");
        return;
      }
      setSaving(true);
      const token = localStorage.getItem("token");
      const numeric = Number(price.replace(/[^0-9.-]/g, "")) || 0;
      await api.patch(
        `/properties/${propertyId}`,
        {
          min_price: numeric,
          is_available: true,
          checkin_date: new Date(checkinDate).toISOString(),
          checkout_date: new Date(checkoutDate).toISOString(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
  alert("Saved");
  // navigate to hosting listings (preserve property_id if present)
  const base = `/hosting/listings?userId=${encodeURIComponent(String(userId))}`;
  const url = propertyId ? `${base}&property_id=${encodeURIComponent(String(propertyId))}` : base;
  router.push(url);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save price");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Now, set a daily base price</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-10">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-4">Guest price</div>
          <div className="flex items-end justify-center gap-3">
            <div className="text-2xl text-gray-600">₫</div>
            <input
              inputMode="numeric"
              value={formatCurrency(price)}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className="text-6xl font-extrabold text-black text-center max-w-[520px] w-full border-b border-gray-200 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Check-in date</label>
            <input
              type="date"
              value={checkinDate}
              onChange={(e) => setCheckinDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Check-out date</label>
            <input
              type="date"
              value={checkoutDate}
              min={checkinDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">Guests will be able to bid for stays within this window.</div>
      </div>
    </div>
  );
}

function defaultDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}
