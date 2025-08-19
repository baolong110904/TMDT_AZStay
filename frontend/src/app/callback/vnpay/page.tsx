"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const txnRef = searchParams?.get("vnp_TxnRef") || "";
    const responseCode = searchParams?.get("vnp_ResponseCode") || "";
    const amountRaw = searchParams?.get("vnp_Amount") || "0";
    const amount = Number(amountRaw) / 100; // VNPay returns amount multiplied by 100

    if (!txnRef) {
      setStatus("failed");
      setMessage("Transaction reference (TxnRef) not found.");
      return;
    }

    // Send all query params to backend to verify signature
    const params: Record<string, string> = {};
    searchParams?.forEach((value, key) => {
      params[key] = value;
    });

    api
      .post("/payment/vnpay/verify", {
        vnp_Params: params,
      })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "Payment completed successfully!");
        } else {
          setStatus("failed");
          setMessage(res.data.message || "Payment failed.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Error verifying the payment.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Payment Result</h1>
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
