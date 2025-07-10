"use client";

import { useRef, useEffect } from "react";
import { IoHomeOutline } from "react-icons/io5";
import { TbBalloon } from "react-icons/tb";
import { MdRoomService } from "react-icons/md";

interface Tab {
  name: string;
  icon: React.ReactNode;
}

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const underlineRef = useRef<HTMLSpanElement>(null);

  const tabs: Tab[] = [
    { name: "Homes", icon: <IoHomeOutline size={20} /> },
    { name: "Experiences", icon: <TbBalloon size={20} /> },
    { name: "Services", icon: <MdRoomService size={20} /> },
  ];

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    const under = underlineRef.current;
    if (activeEl && under) {
      under.style.left = `${activeEl.offsetLeft}px`;
      under.style.width = `${activeEl.offsetWidth}px`;
    }
  }, [activeTab]);

  return (
    <div className="hidden md:flex relative items-center justify-center gap-6 text-sm font-medium text-gray-600">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          ref={(el) => {
            tabRefs.current[tab.name] = el; // No return statement
          }}
          onClick={() => setActiveTab(tab.name)}
          className={`flex items-center gap-2 px-3 py-2 transition-colors duration-200 ${
            activeTab === tab.name ? 'text-blue-900 font-semibold' : 'hover:text-blue-700'
          }`}
          aria-current={activeTab === tab.name ? 'page' : undefined}
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