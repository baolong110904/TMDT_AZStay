"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";
import AdminHeader from "@/components/AdminHeader";
import api from "@/lib/axios";


export default function CatalogPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const router = useRouter();

  // check role
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

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />
        
      </div>
    </div>
  );
}