"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  GlobeAltIcon,
  Bars3Icon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import NavigationTabs from "./NavigationTabs";
import DesktopSearchBar from "./Search/DesktopSearchBar";
import MobileSearchDrawer from "./Search/MobileSearchDrawer";
import DropdownMenu from "./DropdownMenu";
import { UserProfile } from "./Props/UserProfileProps";

interface HeaderProps {
  placeholder?: string;
}

export default function Header({ placeholder }: HeaderProps) {
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // rendering navbar only at top position
  const lastVisible = useRef(true); // nav bar display status
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      
      if (currentY > 120 && lastVisible.current) {
        setShowSearchBar(false);
        lastVisible.current = false;
      } else if (currentY < 60 && !lastVisible.current) {
        setShowSearchBar(true);
        lastVisible.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/home")) setActiveTab("Homes");
    else if (pathname.startsWith("/foryou")) setActiveTab("For you");
    else if (pathname.startsWith("/favorites")) setActiveTab("Favorites");
    else if (pathname.startsWith("/upcoming")) setActiveTab("Favorites");
  }, [pathname]);

  // Check for logged-in user on client mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object" && Object.keys(parsedUser).length > 0) {
          setUser(parsedUser);
        } else {
          console.warn("Invalid user data format, clearing:", storedUser);
          localStorage.removeItem("user");
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle avatar/profile click
  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/user/profile?id=${user.id}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-500 ease-in-out mb-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2 md:px-8">
        {/* Logo */}
        <div className="relative h-12 w-32 md:w-40 flex-shrink-0">
          <Image src="/logo2.png" alt="Logo" fill className="object-contain object-left" />
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right section (both desktop and mobile): Shared dropdown trigger */}
        <div className="flex items-center gap-3 relative">
          <button className="text-sm hidden md:inline text-gray-600 hover:text-blue-700 transition">
            Become a host
          </button>
          {user ? (
            <div className="relative" onClick={handleProfileClick}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "black",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {user.name?.charAt(0) || "U"}
              </div>
            </div>
          ) : (
            <GlobeAltIcon
              className="h-5 w-5 text-gray-500 hover:text-blue-700 cursor-pointer transition"
              aria-label="Change language"
            />
          )}

          {/* Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center border border-gray-300 p-2 rounded-full hover:shadow-md transition cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              <Bars3Icon className="h-5 w-5 text-gray-500" />
              <UserCircleIcon className="h-8 w-8 text-gray-500 ml-2" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
                <DropdownMenu
                  isOpen={isDropdownOpen}
                  setIsOpen={setIsDropdownOpen}
                  user={user}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden md:block">
        <DesktopSearchBar showSearchBar={showSearchBar} placeholder={placeholder} />
      </div>

      {/* Mobile Search Button */}
      <div className="md:hidden flex justify-center px-4 py-2">
        <button
          className="flex items-center bg-white border rounded-full shadow-md px-4 py-3 w-full"
          onClick={() => setIsMobileSearchOpen(true)}
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-semibold text-gray-800 truncate">
            {placeholder || "Start your search"}
          </span>
        </button>
      </div>


      <MobileSearchDrawer isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} />

    </header>
  );
}