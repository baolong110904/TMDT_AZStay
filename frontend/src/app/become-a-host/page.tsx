"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import bedImg from "@/assets/bed.jpg";
import mirrorImg from "@/assets/mirror.jpg";
import doorImg from "@/assets/door.jpg";
import { useEffect, useState } from "react";
import { UserProfile } from "@/components/Props/UserProfileProps";

// ==== Storage helpers (clean) ====
const STORAGE_KEYS = ["user", "userProfile", "currentUser", "profile"] as const; // Ưu tiên "user" (theo ProfilePage)
const ID_KEYS = ["id", "user_id", "userId", "_id", "uid", "ID", "UserId", "UserID"] as const;

type AnyUser = Partial<UserProfile> & Record<string, unknown>;

const safeJSONParse = (value: string | null): unknown => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

function extractIdDeep(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;

  // 1) Thử các key phổ biến ở level hiện tại
  for (const key of ID_KEYS) {
    const v = (obj as any)[key];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  // 2) Một số nhánh thường gặp
  const branches = ["user", "profile", "data", "result", "payload", "account", "currentUser"];
  for (const b of branches) {
    if ((obj as any)[b]) {
      const found = extractIdDeep((obj as any)[b]);
      if (found) return found;
    }
  }
  // 3) Duyệt toàn bộ thuộc tính (fallback cuối)
  for (const v of Object.values(obj as any)) {
    const found = extractIdDeep(v);
    if (found) return found;
  }
  return null;
}

function readStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  for (const key of STORAGE_KEYS) {
    const parsed = safeJSONParse(localStorage.getItem(key)) as AnyUser | null;
    if (!parsed) continue;
    const id = extractIdDeep(parsed);
    if (id) {
      return { ...(parsed as object), id: String(id) } as UserProfile;
    }
  }
  return null;
}

export default function BecomeAHost() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = readStoredUser();
    setUser(u);
    setLoading(false);
  }, []);

  const handleGetStarted = () => {
    if (user?.id) {
      router.push(`/become-a-host/${encodeURIComponent(String(user.id))}/about-your-place`);
      return;
    }
    // KHÔNG tự redirect login nữa để tránh khó chịu khi đã login
    alert("Không tìm thấy userId trong localStorage. Vui lòng kiểm tra dữ liệu đã lưu.");
    try {
      const dump =
        localStorage.getItem("user") ??
        localStorage.getItem("userProfile") ??
        localStorage.getItem("currentUser") ??
        localStorage.getItem("profile");
      console.log("[BecomeAHost] Stored user raw:", dump);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo top left */}
      <div className="absolute top-6 left-25 z-10">
        <div className="relative h-15 w-32 md:w-40 flex-shrink-0">
          <Image src="/logo2.png" alt="Logo" fill className="object-contain object-left" />
        </div>
      </div>

      <div className="flex-1 flex flex-row items-stretch">
        {/* Left: Big title */}
        <div className="flex-1 flex flex-col justify-center pl-32 pr-4">
          <h1 className="text-5xl font-bold text-gray-800 mb-2 leading-tight" style={{ letterSpacing: -1 }}>
            It’s easy to get
            <br />
            started on AZStay
          </h1>
        </div>

        {/* Right: Steps */}
        <div className="w-[620px] flex flex-col justify-center pr-20 pl-0">
          <div className="flex items-center mb-5">
            <div className="text-2xl font-bold text-gray-900 mr-4">1</div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1">Tell us about your place</div>
              <div className="text-gray-600 text-base">Share some basic info, like where it is and how many guests can stay.</div>
            </div>
            <Image src={bedImg} alt="Bed" width={140} height={140} className="ml-6 rounded-xl" />
          </div>
          <hr className="mb-10 border-gray-200" />

          <div className="flex items-center mb-5">
            <div className="text-2xl font-bold text-gray-900 mr-4">2</div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1">Make it stand out</div>
              <div className="text-gray-600 text-base">Add 5 or more photos plus a title and description—we’ll help you out.</div>
            </div>
            <Image src={mirrorImg} alt="Mirror" width={140} height={140} className="ml-6 rounded-xl" />
          </div>
          <hr className="mb-10 border-gray-200" />

          <div className="flex items-center mb-5">
            <div className="text-2xl font-bold text-gray-900 mr-4">3</div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900 mb-1">Finish up and publish</div>
              <div className="text-gray-600 text-base">Choose a starting price, verify a few details, then publish your listing.</div>
            </div>
            <Image src={doorImg} alt="Door" width={140} height={140} className="ml-6 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="w-full border-t-4 border-gray-300 flex items-center justify-end py-4 px-8 bg-white">
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold text-lg px-8 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-500 transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
          onClick={handleGetStarted}
        >
          {loading ? "Loading..." : "Get started"}
        </button>
      </div>

      {/* Exit button */}
      <button
        className="absolute top-6 right-8 border border-gray-300 rounded-full px-5 py-2 text-gray-700 font-medium bg-white hover:bg-gray-100 transition"
        onClick={() => router.push("/home")}
      >
        Exit
      </button>
    </div>
  );
}