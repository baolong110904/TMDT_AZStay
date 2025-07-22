"use client";

import { useState } from "react";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <section className="max-w-md mx-auto my-16">
        <div className="bg-white shadow-lg rounded-lg px-8 py-16 min-h-[500px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login to your account
          </h2>
          <LoginForm />
          <div className="mt-6 text-center text-gray-700">
            <span>Do not have an account? </span>
            <a href="/signup" className="text-blue-600 underline">
              Sign up
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}