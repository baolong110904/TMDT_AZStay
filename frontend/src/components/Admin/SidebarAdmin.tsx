import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "../Avatar";
import Image from "next/image";
import {
  ChartBarIcon,
  UsersIcon,
  HomeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { RiAuctionFill } from "react-icons/ri";

const TABS = [
  { label: "Dashboard", icon: <ChartBarIcon className="h-6 w-6" />, href: "/admin/dashboard" },
  { label: "Auction Management", icon: <RiAuctionFill className="h-6 w-6" />, href: "/admin/auctions" },
  { label: "User/Host Management", icon: <UsersIcon className="h-6 w-6" />, href: "/admin/users" },
  { label: "Catalogs", icon: <HomeIcon className="h-6 w-6" />, href: "/admin/catalogs" },
  { label: "Settings", icon: <CogIcon className="h-6 w-6" />, href: "/admin/settings" },
];

export default function SidebarAdmin({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-1/5 min-h-screen p-4 border-r border-gray-200 border-[0.5px] flex flex-col items-center sticky">
      <div className="mb-18 flex">
        <Image src="/logo2.png" alt="Logo" width={120} height={120} />
      </div>
      <nav className="flex flex-col gap-6 w-full">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.label}
              className={`w-full flex items-center text-lg font-semibold px-6 py-3 rounded-full transition
                ${isActive ? "bg-gray-100" : ""}
                hover:bg-gray-200 hover:shadow-sm cursor-pointer`}
              onClick={() => router.push(tab.href)}
            >
              <span className="mr-3">
                {tab.label === "Dashboard" ? (
                  <Avatar name={user?.name} size={32} imgUrl={user?.avatar || ""} />
                ) : (
                  tab.icon
                )}
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}