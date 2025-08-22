"use client";

import { useState, useRef } from "react";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function VerifyPage() {
  const [pin, setPin] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = pin.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const email = JSON.parse(localStorage.getItem("user") || "{}").email;
      console.log(email);
      if (!email) {
        throw new Error("No email found. Please restart the reset process.");
      }

      const res = await api.post("/user/verify-otp", {
        email,
        otp: code,
      });
      localStorage.removeItem("resetToken");
      // Axios only reaches here if status is 2xx
      if (res.status === 200 && res.data?.token) {
        localStorage.setItem("resetToken", res.data.token);

        // Redirect to change-password page
        router.push("/change-password");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat min-h-screen flex flex-col">
      <Header />
      <section className="max-w-md mx-auto my-16 flex-grow">
        <div className="bg-white shadow-lg rounded-3xl px-8 py-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Verify Your Code</h2>
          <p className="text-gray-600 mb-8 text-center">
            Enter the 6-digit code we sent to your email to verify your password
            reset.
          </p>

          <div className="flex gap-3 mb-6">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 border-2 border-gray-300 text-center text-xl rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
              />
            ))}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
