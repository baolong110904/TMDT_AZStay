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
import DesktopSearchBar from "./DesktopSearchBar";
import MobileSearchDrawer from "./MobileSearchDrawer";
import DropdownMenu from "./DropdownMenu";

interface HeaderProps {
  placeholder?: string;
}

export default function Header({ placeholder }: HeaderProps) {
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Throttle scroll
  const throttle = (callback: () => void, limit: number) => {
    let inThrottle: boolean;
    return () => {
      if (!inThrottle) {
        callback();
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const shouldShow = currentScroll <= 100 || currentScroll < lastScrollTop.current;

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        requestAnimationFrame(() => {
          setShowSearchBar(shouldShow);
          lastScrollTop.current = currentScroll;
        });
      }, 50);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener("scroll", throttledScroll);
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

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

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm transition-all duration-500 ease-in-out">
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
          <GlobeAltIcon className="h-5 w-5 text-gray-500 hover:text-blue-700 cursor-pointer transition" aria-label="Change language" />

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
                <DropdownMenu isOpen={isDropdownOpen} setIsOpen={setIsDropdownOpen} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Search Bar */}
      <DesktopSearchBar showSearchBar={showSearchBar} placeholder={placeholder} />

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