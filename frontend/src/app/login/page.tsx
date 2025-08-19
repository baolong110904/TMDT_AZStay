"use client";

import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import LoginForm from "../../components/Login/LoginForm";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { googleLogin } from "@/utils/signup/googleLogin";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat">
      <Header />
      <section className="max-w-md mx-auto my-16">
        <div className="bg-white shadow-lg rounded-3xl px-8 py-16 min-h-[500px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login to your account
          </h2>
          <LoginForm />
          <div className="mt-6 text-center text-black">
            <span>Do not have an account? </span>
            <a href="/signup" className="text-blue-600 underline">
              Sign up
            </a>
          </div>

          {/* google login button */}
          <div className="text-center mt-6">
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
              type="button"
              disabled={loading}
              onClick={() => googleLogin(router, setLoading, setError)}
              className="inline-flex items-center border border-neutral-600 gap-2 bg-white hover:bg-blue-100 text-black text-sm px-4 py-2 rounded-3xl w-[200px] justify-center"
            >
              <FcGoogle className="w-5 h-5" />
              <span>{loading ? "Redirecting..." : "Login with Google"}</span>
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
