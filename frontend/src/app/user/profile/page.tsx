"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import Sidebar from "@/components/SidebarProfile";
import AboutMeSection from "@/components/Profile/AboutMeSection";
import EditProfileSection from "@/components/EditProfileSection";
import Header from "@/components/SubHeader"; 
import { UserProfile } from "@/components/Type/UserProfileProps";

const PROFILE_EDIT_FIELDS = [
  { key: "work", label: "My work", icon: "💼" },
  { key: "funFact", label: "My fun fact", icon: "💡" },
  { key: "decadeBorn", label: "Decade I was born", icon: "🎂" },
  { key: "uselessSkill", label: "My most useless skill", icon: "✏️" },
  { key: "favSong", label: "My favorite song in high school", icon: "🎵" },
  { key: "bioTitle", label: "My biography title would be", icon: "📖" },
  { key: "whereGo", label: "Where I've always wanted to go", icon: "🌍" },
  { key: "pets", label: "Pets", icon: "🐾" },
  { key: "school", label: "Where I went to school", icon: "🎓" },
  { key: "tooMuchTime", label: "I spend too much time", icon: "⏰" },
  { key: "languages", label: "Languages I speak", icon: "🌐" },
  { key: "obsessed", label: "I'm obsessed with", icon: "❤️" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>();
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileFields, setProfileFields] = useState<UserProfile>({} as UserProfile);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") ?? "";
  
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

  const handleFieldChange = (key: string, value: string) => {
    setProfileFields((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (avatar) formData.append("avatar", avatar);
    if (password) formData.append("password", password);
    Object.keys(profileFields).forEach((key) => {
      formData.append(key, (profileFields as any)[key]);
    });

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
              password={password}
              error={error}
              success={success}
              profileFields={profileFields}
              handleAvatarChange={handleAvatarChange}
              handleFieldChange={handleFieldChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              setUser={setUser}
              setPassword={setPassword}
              PROFILE_EDIT_FIELDS={PROFILE_EDIT_FIELDS}
            />
          )}
        </main>
      </div>
    </div>
  );
}