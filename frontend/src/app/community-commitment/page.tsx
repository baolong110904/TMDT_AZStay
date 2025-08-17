"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/SubHeader";
import Footer from "@/components/Footer";
import { useState } from "react";
import dynamic from "next/dynamic";

export default function CommunityCommitment() {
  const router = useRouter();

  const handleAgree = () => {
    router.push("/become-a-host");
  };

  const [showCancel, setShowCancel] = useState(false);
  const CancelCommitment = dynamic(() => import("./cancel"), { ssr: false });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-20">
        {showCancel ? (
          <CancelCommitment onGoBack={() => setShowCancel(false)} />
        ) : (
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center mx-auto"
          style={{ maxWidth: 580, minWidth: 390, width: "100%", padding: "40px 36px 36px 36px" }}
        >
          <Image src="/logo.png" alt="Logo" width={60} height={60} className="mb-4" />
          <div className="w-full">
            <div className="font-semibold text-gray-800 text-base mb-2" style={{letterSpacing: 0.1}}>Our community commitment</div>
            <div className="font-bold text-2xl text-gray-900 mb-4 leading-tight" style={{lineHeight: 1.2}}>
              AZStay is a community where anyone can belong
            </div>
            <div className="text-gray-700 text-base mb-4" style={{lineHeight: 1.5}}>
              To ensure this, we’re asking you to commit to the following:
            </div>
            <div className="text-gray-700 text-base mb-8" style={{lineHeight: 1.5}}>
              I agree to treat everyone in the AZStay community—regardless of their race, religion, national origin, ethnicity, disability, sex, gender identity, sexual orientation, or age—with respect, and without judgment or bias.
            </div>
          </div>
          <button
            className="w-full mb-3 py-3 rounded-lg font-semibold text-lg text-white transition shadow-sm bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 hover:shadow-lg focus:outline-none cursor-pointer"
            style={{ letterSpacing: 0.1 }}
            onClick={handleAgree}
          >
            Agree and continue
          </button>
          <button
            className="w-full border-blue-600 text-blue-700 py-3 rounded-lg font-semibold text-lg transition hover:from-blue-700 hover:to-blue-500 cursor-pointer"
            onClick={() => setShowCancel(true)}
            style={{letterSpacing: 0.1}}
          >
            Decline
          </button>
        </div>
    )}
      </main>
      <Footer />
    </div>
  );
}
