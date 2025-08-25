"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { TbBalloon } from "react-icons/tb";
import { MdFavorite, MdRecommend } from "react-icons/md";
import clsx from "clsx";
import { useRouter } from "next/navigation";

interface Tab {
  name: string;
  icon: React.ReactNode;
  href: string;
}

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationTabs({
  activeTab,
  setActiveTab,
}: NavigationTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const underlineRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    // Read user and id from localStorage
    try {
      const lsUserId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const storedUser =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let uid = lsUserId || "";
      let role: number | null = null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          uid = uid || parsed?.user_id || parsed?.id || "";
          role = parsed?.role_id ?? null;
        } catch {
          // ignore
        }
      }
      setUserId(uid);
      setRoleId(typeof role === "number" ? role : null);
    } catch {
      // ignore
    }
  }, []);

  const tabs: Tab[] = useMemo(() => {
    const base: Tab[] = [
      { name: "Homes", icon: <IoHomeOutline size={20} />, href: "/home" },
      { name: "For you", icon: <MdRecommend size={20} />, href: "/foryou" },
      { name: "Favorites", icon: <MdFavorite size={20} />, href: "/favorites" },
    ];
    const isHost = roleId === 3 || roleId === 4;
    if (isHost) {
      const hostingHref = userId
        ? `/hosting/listings?userId=${encodeURIComponent(String(userId))}`
        : "/hosting/listings";
      base.push({
        name: "Hosting",
        icon: <TbBalloon size={20} />,
        href: hostingHref,
      });
    }
    return base;
  }, [roleId, userId]);

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const underline = underlineRef.current;
    if (activeEl && underline) {
      underline.style.left = `${activeEl.offsetLeft}px`;
      underline.style.width = `${activeEl.offsetWidth}px`;
    }
    console.log(activeTab);
  }, [activeTab]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.name);
    router.push(tab.href);
  };

  return (
    <div className="hidden md:flex relative items-center justify-center gap-6 text-sm font-medium text-gray-600">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          ref={(el) => {
            tabRefs.current[tab.name] = el;
          }}
          onClick={() => handleTabClick(tab)}
          aria-current={activeTab === tab.name ? "page" : undefined}
          className={clsx(
            "cursor-pointer flex items-center gap-2 px-3 py-2 transition-colors duration-200",
            {
              "text-blue-900 font-semibold": activeTab === tab.name,
              "hover:text-blue-700": activeTab !== tab.name,
            }
          )}
        >
          {tab.icon}
          <span>{tab.name}</span>
        </button>
      ))}

      <span
        ref={underlineRef}
        className="absolute bottom-0 h-0.5 bg-blue-700 rounded-full transition-all duration-300"
      />
    </div>
  );
}
