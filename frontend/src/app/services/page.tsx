"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto my-8 px-4">
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-lg mb-6">
          HUHUHUHU
        </p>

        {/* Custom service content */}
        <section className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold">Travel LEULEULEU</h2>
            <p>LEULEULEU</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold">LEULEULEU</h2>
            <p>LEULEULEU</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold">LEULEULEU</h2>
            <p>LEULEULEU</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
