"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function PaypalCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");
    const bookingId = searchParams?.get("bookingId");

    console.log({ token, bookingId });

    if (!token || !bookingId) {
      setStatus("failed");
      setMessage("Payment information not found.");
      return;
    }

    // Send to backend to verify & capture payment
    api
      .post("/payment/paypal/verify", {
        token,
        bookingId,
      })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "PayPal payment completed successfully!");
        } else {
          setStatus("failed");
          setMessage(res.data.message || "PayPal payment failed.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Error verifying PayPal payment.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">PayPal Payment Result</h1>
      {status === "pending" && <p>Processing payment...</p>}
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "failed" && <p className="text-red-600">{message}</p>}

      <Link
        href="/home"
        className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
