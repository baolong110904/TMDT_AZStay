"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import Sidebar from "@/components/SidebarProfile";
import AboutMeSection from "@/components/Profile/AboutMeSection";
import EditProfileSection from "@/components/EditProfileSection";
import Header from "@/components/SubHeader"; 
import { UserProfile } from "@/components/Props/UserProfileProps";


export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>();
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get("id") : null;
  
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

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError("User not found.");
      return;
    }

    const formData = new FormData();
    if (avatar) formData.append("avatar", avatar);
    if (password) formData.append("password", password);

    try {
      if (!user) return;
      const response = await api.put(`/user/update/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            ...response.data.user,
            avatar: response.data.user.avatar || user.imageId,
          })
        );
        setUser((prev: any) => ({ ...prev, ...response.data.user }));
      }
    } catch (err: any) {
      console.error("Update error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };
  
  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex border-r">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

        <main className="flex-1 px-12 pt-8"> {/* Add top padding if needed */}
          {!editMode ? (
            <AboutMeSection user={user} onEdit={() => setEditMode(true)} />
          ) : (
            <EditProfileSection
              user={user}
              avatar={avatar}
              error={error}
              success={success}
              handleAvatarChange={handleAvatarChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              setUser={setUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}