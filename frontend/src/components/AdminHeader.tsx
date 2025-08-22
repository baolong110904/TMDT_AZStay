"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import Avatar from "./Avatar";

export default function AdminHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object" && Object.keys(parsedUser).length > 0) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("resetToken");
    setUser(null);
    router.push("/login");
  };

  // Hiệu ứng trượt:
  const leftSlide  = isSearchFocused ? "-translate-x-2 sm:-translate-x-1" : "translate-x-9 sm:translate-x-6";
  const rightSlide = isSearchFocused ? " translate-x-2 sm: translate-x-1" : "-translate-x-9 sm:-translate-x-6";

  return (
    <header className="flex items-center justify-between p-4">
      {/* Nhóm trái (Home) */}
      <div className={`shrink-0 transition-transform duration-300 ${leftSlide}`}>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={() => router.push("/home")}
          aria-label="Go home"
        >
          <HomeIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Search Bar (ở giữa, mở rộng khi focus) */}
      <div className="flex-1 flex justify-center">
        <div
          className={`relative flex items-center transition-all duration-300 ${
            isSearchFocused ? "w-2/3" : "w-1/3"
          }`}
        >
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border-[0.5px] border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-gray-50 focus:ring-2 focus:ring-blue-500 transition"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          <button className="absolute right-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition">
            <MagnifyingGlassIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Nhóm phải (icons + avatar) */}
      <div className={`flex items-center gap-3 shrink-0 transition-transform duration-300 ${rightSlide}`}>
        {/* <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Messages">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-500" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
          <BellIcon className="h-6 w-6 text-gray-500" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Settings">
          <CogIcon className="h-6 w-6 text-gray-500" />
        </button> */}

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center transition cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
          >
            <Avatar name={user?.name || "User"} size={40} imgUrl={user?.imgUrl} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Admin Tool 1</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Admin Tool 2</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
