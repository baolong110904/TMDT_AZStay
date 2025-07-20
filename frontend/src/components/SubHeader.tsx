"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GlobeAltIcon, Bars3Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import NavigationTabs from "./NavigationTabs";
import MobileSearchDrawer from "./MobileSearchDrawer";
import DropdownMenu from "./DropdownMenu";

export default function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Throttle function to limit scroll event frequency
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
      // No search bar logic needed anymore, but keep scroll logic if required
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        window.requestAnimationFrame(() => {
          lastScrollTop.current = currentScroll;
        });
      }, 50);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Handle navigation based on activeTab
  // Sync activeTab with URL
  useEffect(() => {
    if (!pathname) return; 

    if (pathname.startsWith("/home")) setActiveTab("Homes");
    else if (pathname.startsWith("/experience")) setActiveTab("Experiences");
    else if (pathname.startsWith("/services")) setActiveTab("Services");
  }, [pathname]);

  // Navigate when tab changes
  useEffect(() => {
    if (activeTab === "Homes") {
      router.push("/home");
    } else if (activeTab === "Experiences") {
      router.push("/experience");
    } else if (activeTab === "Services") {
      router.push("/services");
    }
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
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 md:px-8">
        <div className="relative h-12 w-40 flex-shrink-0">
          <Image src="/logo2.png" alt="Logo" fill className="object-contain object-left" />
        </div>
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm text-gray-600 hover:text-blue-700 transition">Become a host</button>
          <GlobeAltIcon className="h-5 text-gray-500 hover:text-blue-700 cursor-pointer transition" aria-label="Change language" />
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
        <div className="md:hidden flex items-center gap-3">
          <GlobeAltIcon className="h-5 text-gray-500 cursor-pointer" aria-label="Change language" />
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