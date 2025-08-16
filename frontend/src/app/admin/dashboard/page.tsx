"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";

// icons
import { FaHome } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { RiAuctionFill } from "react-icons/ri";
import { BiSolidCategory } from "react-icons/bi";

// chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Chart } from "react-chartjs-2"; // ✅ React component
import { Bar, Pie } from "react-chartjs-2"; // pie + bar
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TreemapController,
  TreemapElement
);

// mock data
const mockBarData = {
  labels: [
    "Apartment",
    "Home",
    "Villa",
    "Bungalow",
    "Homestay",
    "Studio Apartment",
    "Penthouse Apartment",
    "Serviced Apartment",
    "Townhouse",
  ],
  datasets: [
    {
      label: "Properties per Category",
      data: Array.from({ length: 9 }, () => Math.floor(Math.random() * 100)),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};

const mockPieData = {
  labels: ["Customer", "Property Owner", "Both"],
  datasets: [
    {
      data: [120, 80, 40],
      backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
      borderWidth: 1,
    },
  ],
};

// Treemap
const mockTreemapData = {
  datasets: [
    {
      tree: [
        { category: "Apartment", value: 30 },
        { category: "Home", value: 50 },
        { category: "Villa", value: 20 },
        { category: "Bungalow", value: 15 },
        { category: "Homestay", value: 10 },
      ],
      key: "value",
      groups: ["category"],
      data: [],
      backgroundColor: (ctx: any) => {
        const colors = ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236"];
        return colors[ctx.dataIndex % colors.length];
      },
      borderColor: "#fff",
      borderWidth: 2,
    },
  ],
};

export default function AdminPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role_id);
        if (parsedUser.role_id !== 1) {
          router.push("/user/profile");
        }
      } catch (e) {
        console.error("Failed to parse user data:", e);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  if (userRole !== 1) return <p>Loading...</p>;

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />
        <main className="mt-8">
          <div className="flex flex-col gap-6">
            {/* Info section */}
            <div className="flex flex-row gap-6">
              {/* info cards */}
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <FaHome size={26} /> Total Properties
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">300</p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <FaUser size={26} /> Total Users
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">400</p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <RiAuctionFill size={26} /> Current Biddings
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">500</p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <BiSolidCategory size={26} /> Total Categories
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">400</p>
              </div>
            </div>

            {/* 3 charts aside */}
            <div className="flex flex-row gap-6">
              {/* Pie Chart */}
              <div className="p-4 h-[300px] shadow border border-gray-300 rounded-3xl w-1/3">
                <Pie data={mockPieData} options={{
                  maintainAspectRatio: false
                }}/>
              </div>

              {/* Treemap */}
              <div className="p-4 h-[300px] shadow border border-gray-300 rounded-3xl w-1/3">
                <Chart
                  type="treemap"
                  data={mockTreemapData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>

              {/* Horizontal Bar */}
              <div className="p-4 h-[300px] shadow border border-gray-300 rounded-3xl w-1/3">
                <Bar
                  data={mockBarData}
                  options={{
                    indexAxis: "y" as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" as const },
                    },
                    scales: {
                      x: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="p-4 shadow border border-gray-300 rounded-3xl max-w-screen">
              <Bar
                data={mockBarData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
