"use client";

import { useState } from "react";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import SignupForm from "../../components/SignupForm";

export default function SignupPage() {
  return (
    <>
      <Header />
      <section className="max-w-md mx-auto my-16">
        <div className="bg-white shadow-lg rounded-lg px-8 py-16 min-h-[500px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Create an account
          </h2>
          <SignupForm />
          <div className="mt-6 text-center text-gray-700">
            <span>Already have an account? </span>
            <a href="/login" className="text-blue-600 underline">
              Login
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}