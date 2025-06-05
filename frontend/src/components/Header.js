// src/components/Header.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Bars3Icon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { IoHomeOutline } from "react-icons/io5";
import { TbBalloon } from "react-icons/tb";
import { MdRoomService } from "react-icons/md";

function Header() {
  const [activeTab, setActiveTab] = useState("Homes");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const tabRefs = useRef({});
  const underlineRef = useRef(null);

  const tabs = [
    { name: "Homes", icon: <IoHomeOutline size={20} /> },
    { name: "Experiences", icon: <TbBalloon size={20} /> },
    { name: "Services", icon: <MdRoomService size={20} /> },
  ];

  const searchFields = [
    { label: "Where", placeholder: "Search destinations" },
    { label: "Date", placeholder: "Add dates" },
    { label: "Type of service", placeholder: "Add service" },
  ];

  useEffect(() => {
    const activeTabEl = tabRefs.current[activeTab];
    const underlineEl = underlineRef.current;

    if (activeTabEl && underlineEl) {
      const offsetLeft = activeTabEl.offsetLeft;
      const width = activeTabEl.offsetWidth;
      underlineEl.style.left = `${offsetLeft}px`;
      underlineEl.style.width = `${width}px`;
    }
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Nav */}
      <div className="max-w-8xl mx-auto flex items-center justify-between p-4 md:px-10">
        {/* Logo */}
        <div className="relative h-15 w-24 flex-shrink-0 cursor-pointer">
          <Image
            src="/logo2.png"
            alt="Logo"
            fill
            className="object-contain object-left"
          />
        </div>

        {/* Tabs (Hidden on mobile) */}
        <div className="hidden md:flex relative items-center justify-center space-x-6 text-sm text-gray-600 font-medium">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              ref={(el) => (tabRefs.current[tab.name] = el)}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center space-x-1 px-2 py-2 transition-all duration-200 ${
                activeTab === tab.name ? "text-blue-950 font-semibold" : ""
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
          {/* Sliding Underline */}
          <span
            ref={underlineRef}
            className="absolute bottom-0 h-0.5 bg-blue-700 rounded"
            style={{
              left: 0,
              width: 0,
              transition: "left 0.3s ease, width 0.3s ease",
            }}
          />
        </div>

        {/* Right Side (Hidden on mobile except menu) */}
        <div className="hidden md:flex items-center space-x-3 md:space-x-4">
          <p className="text-sm cursor-pointer hover:underline">Become a host</p>
          <GlobeAltIcon className="h-5 text-gray-500 cursor-pointer" />
          <div className="flex items-center border border-gray-300 p-2 rounded-full cursor-pointer hover:shadow-md transition">
            <Bars3Icon className="h-5 text-gray-500" />
            <UserCircleIcon className="h-8 text-gray-500 ml-2" />
          </div>
        </div>

        {/* Mobile Menu (Hidden on desktop) */}
        <div className="md:hidden flex items-center space-x-3">
          <GlobeAltIcon className="h-5 text-gray-500 cursor-pointer" />
          <div className="flex items-center border border-gray-300 p-2 rounded-full cursor-pointer hover:shadow-md transition">
            <Bars3Icon className="h-5 text-gray-500" />
            <UserCircleIcon className="h-8 text-gray-500 ml-2" />
          </div>
        </div>
      </div>

      {/* Search Bar - Desktop Version */}
      <div className="hidden md:flex justify-center px-4 pb-4">
        <div className="flex items-center bg-white border rounded-full shadow-md px-4 py-2 sm:py-3 w-full max-w-5xl gap-4">
          {searchFields.map((field, i) => (
            <div
              key={i}
              className="flex flex-col text-sm w-full sm:w-auto flex-grow"
            >
              <span className="font-semibold text-gray-800">
                {field.label}
              </span>
              <input
                type="text"
                placeholder={field.placeholder}
                className="bg-transparent placeholder-gray-500 outline-none w-full"
              />
            </div>
          ))}
          <div className="bg-blue-500 p-3 rounded-full cursor-pointer hover:bg-blue-600 transition duration-200">
            <MagnifyingGlassIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Simplified */}
      <div className="md:hidden flex justify-center px-4 pb-4">
        <div 
          className="flex items-center bg-white border rounded-full shadow-md px-4 py-3 w-full cursor-pointer"
          onClick={() => setIsMobileSearchOpen(true)}
        >
          <div className="flex flex-col text-left w-full pl-2">
            <span className="font-semibold text-gray-800">Start your search</span>
          </div>
          <div className="bg-blue-500 p-2 rounded-full">
            <MagnifyingGlassIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 p-4">
          <div className="flex justify-between items-center mb-6">
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">Search</h2>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </div>
          
          <div className="space-y-4">
            {searchFields.map((field, i) => (
              <div key={i} className="border-b pb-3">
                <span className="font-semibold text-gray-800 block mb-1">
                  {field.label}
                </span>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="bg-transparent placeholder-gray-500 outline-none w-full text-lg"
                />
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <button className="w-full bg-blue-500 text-white py-3 rounded-full font-medium hover:bg-blue-600 transition flex items-center justify-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;