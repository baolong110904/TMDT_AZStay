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
    const amount = Number(amountRaw) / 100; // VNPay trả về *100

    if (!txnRef) {
      setStatus("failed");
      setMessage("Không tìm thấy mã giao dịch (TxnRef).");
      return;
    }

    // Gửi toàn bộ query params về backend để xác thực chữ ký
    const params: Record<string, string> = {};
    searchParams?.forEach((value, key) => {
      params[key] = value;
    });

    api
      .post("/payment/verify", {
        vnp_Params: params,
      })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setMessage("Thanh toán thành công!");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Lỗi khi xác thực thanh toán.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Kết quả thanh toán</h1>
      {status === "pending" && <p>Đang xử lý...</p>}
      {status === "success" && <p className="text-green-600">{message}</p>}
      {status === "failed" && <p className="text-red-600">{message}</p>}

      {/* Nút quay về home */}
      <Link
        href="/home"
        className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
