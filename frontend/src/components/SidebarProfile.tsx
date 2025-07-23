import React from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import work from "@/assets/work.png";
import connection from "@/assets/connection.png";

const TABS = [
  {
    label: "About me",
    icon: null,
    href: "/user/profile",
  },
  {
    label: "Past trips",
    icon: <img src={work.src} alt="Past trips" width={24} height={24} />,
    href: "/user/past-trip",
  },
  {
    label: "Connections",
    icon: <img src={connection.src} alt="Connections" width={24} height={24} />,
    href: "/user/connections",
  },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
}: {
  activeTab: number;
  setActiveTab: (idx: number) => void;
  user: any;
}) {
  const router = useRouter();

  return (
    <aside className="w-1/4 min-h-screen p-12 pr-0 border-r border-gray-200 border-[0.5px]">
      <h1 className="text-3xl font-bold mb-12">Profile</h1>
      <nav className="flex flex-col gap-6">
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
              {idx === 0 ? <Avatar name={user?.name} size={32} /> : tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}