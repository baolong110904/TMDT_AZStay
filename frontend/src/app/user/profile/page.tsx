"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object" && parsedUser.id === id) {
          setUser(parsedUser);
        } else {
          router.push("/login");
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [id, router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-gray-900">{user.name || "Not specified"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-gray-900">{user.email || "Not specified"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <p className="mt-1 text-gray-900">********</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Gender</label>
          <p className="mt-1 text-gray-900">{user.gender || "Not specified"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="mt-1 text-gray-900">{user.phone || "Not specified"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Role</label>
          <p className="mt-1 text-gray-900">{user.role || "Not specified"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">DOB</label>
          <p className="mt-1 text-gray-900">{user.dob || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
}