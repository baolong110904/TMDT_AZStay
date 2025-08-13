"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/AdminHeader";
import SidebarAdmin from "@/components/SidebarAdmin";

export default function AdminPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // Changed type to number for compatibility
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role_id);
        if (parsedUser.role_id !== 1) {
          router.push("/user/profile");
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  if (userRole !== 1) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-white flex">
      <SidebarAdmin activeTab={activeTab} setActiveTab={setActiveTab} user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8">
        <Header />
        <main className="mt-8">
          {/* Content for the admin dashboard goes here */}
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <p>Welcome to the admin dashboard. Here you can manage users, view reports, and more.</p>
        </main>
      </div>
    </div>
  );
}
