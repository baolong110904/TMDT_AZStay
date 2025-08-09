"use client";

// import { useState } from "react";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import SignupForm from "../../components/Signup/SignupForm";
import { FaFacebook } from "react-icons/fa6";

export default function SignupPage() {
  return (
    <div className="bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat">
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
          <div className="text-center mt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
            >
              <FaFacebook className="w-5 h-5" />
              <span>Sign up with Facebook</span>
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}