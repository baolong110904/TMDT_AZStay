"use client";

import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });
      await api.post("/user/send-otp", { email });
      localStorage.setItem("user", JSON.stringify({ email }));
      
      alert("Email sent successfully, check your Email to verify OTP.");
      router.push("/verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat">
      <Header />
      <section className="max-w-md mx-auto my-16">
        <div className="bg-white shadow-lg rounded-3xl px-8 py-16 min-h-[500px] flex flex-col justify-center">
          <h2 className="text-xl font-bold text-center mb-6">
            Enter your email to get OTP code
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-4 py-2 rounded-3xl"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-3xl hover:bg-blue-700"
            >
              {loading ? "Sending OTP..." : "Confirm"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
