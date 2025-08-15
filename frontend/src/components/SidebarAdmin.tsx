import React from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import Image from "next/image";
import { ChartBarIcon, UsersIcon, HomeIcon, WrenchScrewdriverIcon, CogIcon } from "@heroicons/react/24/outline";

const TABS = [
  { label: "Dashboard", icon: <ChartBarIcon className="h-6 w-6" />, href: "/admin/dashboard" },
  { label: "User/Host Management", icon: <UsersIcon className="h-6 w-6" />, href: "/admin/users" },
  { label: "Room Management", icon: <HomeIcon className="h-6 w-6" />, href: "/admin/rooms" },
  { label: "Auction Management", icon: <WrenchScrewdriverIcon className="h-6 w-6" />, href: "/admin/auctions" },
  { label: "Settings", icon: <CogIcon className="h-6 w-6" />, href: "/admin/settings" },
];

export default function SidebarAdmin({ activeTab, setActiveTab, user }: { activeTab: number; setActiveTab: (idx: number) => void; user: any }) {
  const router = useRouter();

  return (
    <aside className="w-1/4 min-h-screen p-8 pr-0 border-r border-gray-200 border-[0.5px] flex flex-col items-center">
      <div className="mb-12 flex justify-start">
        <Image src="/logo2.png" alt="Logo" width={120} height={120} />
      </div>
      <nav className="flex flex-col gap-6 w-full">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            className={`flex items-center text-lg font-semibold px-6 py-3 rounded-full transition
              ${activeTab === idx ? "bg-gray-100" : ""}
              hover:bg-gray-200 hover:shadow-sm`}
            onClick={() => {
              setActiveTab(idx);
              router.push(tab.href);
            }}
            style={{
              cursor: "pointer",
            }}
          >
            <span className="mr-3">
              {idx === 0 ? <Avatar name={user?.name} size={32} imgUrl={user?.avatar || ""} /> : tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
