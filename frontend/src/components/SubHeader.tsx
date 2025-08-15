"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  GlobeAltIcon,
  Bars3Icon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import NavigationTabs from "./NavigationTabs";
import MobileSearchDrawer from "./Search/MobileSearchDrawer";
import DropdownMenu from "./DropdownMenu";

export default function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (
          parsedUser &&
          typeof parsedUser === "object" &&
          Object.keys(parsedUser).length > 0
        ) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Dropdown close logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // Handle avatar/profile click
  const handleProfileClick = () => {
    if (user?.role_id === 1) {
      router.push(`/admin`);
    } else if (user?.id) {
      router.push(`/user/profile?id=${user.id}`);
    }
  };

  // Tabs and navigation (unchanged)
  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/home")) setActiveTab("Homes");
    else if (pathname.startsWith("/experience")) setActiveTab("Experiences");
    else if (pathname.startsWith("/services")) setActiveTab("Services");
  }, [pathname]);

  useEffect(() => {
    if (activeTab === "Homes") router.push("/home");
    else if (activeTab === "Experiences") router.push("/experience");
    else if (activeTab === "Services") router.push("/services");
  }, [activeTab, router]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 md:px-8">
        {/* Logo */}
        <div className="relative h-12 w-40 flex-shrink-0">
          <Image src="/logo2.png" alt="Logo" fill className="object-contain object-left" />
        </div>
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-600 hover:text-blue-700 transition">
            Become a host
          </button>
          {/* Avatar only if logged in */}
          {user &&
            <div
              onClick={handleProfileClick}
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
              title={user.name}
              className="ml-1"
            >
              {user.name?.charAt(0) || "U"}
            </div>
          }
          {/* Globe icon only if not logged in */}
          {!user &&
            <GlobeAltIcon className="h-5 text-gray-500 hover:text-blue-700 cursor-pointer transition" aria-label="Change language" />
          }
          {/* Dropdown trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center border border-gray-300 p-2 rounded-full hover:shadow-md transition cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="User menu"
            >
              <Bars3Icon className="h-5 w-5 text-gray-500" />
              <UserCircleIcon className="h-8 w-8 text-gray-500 ml-2" />
            </button>
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
        <div className="md:hidden flex items-center gap-3">
          {!user &&
            <GlobeAltIcon className="h-5 text-gray-500 cursor-pointer" aria-label="Change language" />
          }
          <button
            className="flex items-center border border-gray-300 p-2 rounded-full hover:shadow-md transition"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Open search menu"
          >
            <Bars3Icon className="h-5 text-gray-500" aria-hidden="true" />
            <UserCircleIcon className="h-8 text-gray-500 ml-2" aria-hidden="true" />
          </button>
        </div>
      </div>
      <MobileSearchDrawer isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} />
    </header>
  );
}