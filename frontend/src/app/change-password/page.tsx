"use client";

import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Retrieve reset token (stored after verify step)
      const resetToken = localStorage.getItem("resetToken");
      if (!resetToken) {
        setError("No reset token found. Please verify again.");
        setLoading(false);
        return;
      }
      console.log("Stored token:", localStorage.getItem("resetToken"));

      const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      await api.post(
        "/user/change-password",
        { newPassword }, // only send the password in the body
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      );

      localStorage.removeItem("resetToken");
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert("Password changed successfully. Please log in again.");
      router.push("/login");
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
            Change Password
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border px-4 py-2 rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
