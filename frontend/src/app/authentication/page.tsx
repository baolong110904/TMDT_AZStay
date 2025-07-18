"use client";

import { useState } from "react";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import LoginForm from "../../components/LoginForm";
import SignupForm from "../../components/SignupForm";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <>
      <Header />
      <section className="max-w-md mx-auto my-16">
        <div className="bg-white shadow-lg rounded-lg px-8 py-16 min-h-[500px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {mode === "login" ? "Login to your account" : "Create an account"}
          </h2>
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}
          <div className="mt-6 text-center text-gray-700">
            {mode === "login" ? (
              <>
                <span>Do not have an account? </span>
                <button
                  className="text-blue-600 underline"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <button
                  className="text-blue-600 underline"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}