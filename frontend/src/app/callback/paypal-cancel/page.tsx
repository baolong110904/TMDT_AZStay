"use client";

import Link from "next/link";

export default function PaypalCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">PayPal Payment Canceled</h1>
      <p className="text-yellow-600">
        You have canceled the payment process. Your booking has not been confirmed.
      </p>

      <Link
        href="/home"
        className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
