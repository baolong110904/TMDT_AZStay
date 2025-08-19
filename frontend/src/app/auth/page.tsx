"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncWithBackend } from "@/utils/signup/googleLogin";

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      await syncWithBackend(router);
    };
    run();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-700">Signing you in, please wait ❤️...</p>
    </div>
  );
}