"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";
import api from "@/lib/axios";

// icons
import { FaHome, FaUser } from "react-icons/fa";
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
  PointElement,
  LineElement,
} from "chart.js";

import { Chart } from "react-chartjs-2";
import { Bar, Pie, Line } from "react-chartjs-2";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TreemapController,
  TreemapElement,
  PointElement,
  LineElement,
  ChartDataLabels
);

// fallback mock data
const mockRevenue = [
  // 2023
  { month: "01/2023", total: 5000 },
  { month: "02/2023", total: 7200 },
  { month: "03/2023", total: 8100 },
  { month: "04/2023", total: 6500 },
  { month: "05/2023", total: 9400 },
  { month: "06/2023", total: 10200 },
  { month: "07/2023", total: 8800 },
  { month: "08/2023", total: 9600 },
  { month: "09/2023", total: 11000 },
  { month: "10/2023", total: 15000 },
  { month: "11/2023", total: 17000 },
  { month: "12/2023", total: 20000 },

  // 2024
  { month: "01/2024", total: 10500 },
  { month: "02/2024", total: 11900 },
  { month: "03/2024", total: 9800 },
  { month: "04/2024", total: 12300 },
  { month: "05/2024", total: 14000 },
  { month: "06/2024", total: 13500 },
  { month: "07/2024", total: 16000 },
  { month: "08/2024", total: 17500 },
  { month: "09/2024", total: 19000 },
  { month: "10/2024", total: 20000 },
  { month: "11/2024", total: 21500 },
  { month: "12/2024", total: 23000 },

  // 2025
  { month: "01/2025", total: 12500 },
  { month: "02/2025", total: 14500 },
  { month: "03/2025", total: 16000 },
  { month: "04/2025", total: 17800 },
  { month: "05/2025", total: 18500 },
  { month: "06/2025", total: 19000 },
  { month: "07/2025", total: 20000 },
];

export default function AdminPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const [header, setHeader] = useState<any>(null);
  const [pie, setPie] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const router = useRouter();

  // check role
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

  // fetch dashboard data
  useEffect(() => {
    if (userRole === 1) {
      api
        .get("/admin/get-dashboard")
        .then((res) => {
          const data = res.data.data;
          setHeader(data.header);
          setPie(data.pie);
          setCategories(data.categories);
          setRevenue(data.revenue.length ? data.revenue : mockRevenue);
        })
        .catch((err) => {
          console.error("❌ Failed to load dashboard data:", err);
        });
    }
  }, [userRole]);

  if (userRole !== 1 || !header) return <p>Loading...</p>;

  // Pie chart data
  const pieData = {
    labels: pie.map((p) => p.role_name),
    datasets: [
      {
        data: pie.map((p) => p.count),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4CAF50"],
      },
    ],
  };

  // Treemap data
  const treemapData = {
    datasets: [
      {
        tree: categories.map((c) => ({
          category: c.category_name,
          value: c.total,
        })),
        key: "value",
        groups: ["category"],
        data: [],
        backgroundColor: (ctx: any) => {
          const colors = [
            "#4dc9f6",
            "#f67019",
            "#f53794",
            "#537bc4",
            "#acc236",
          ];
          return colors[ctx.dataIndex % colors.length];
        },
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data (categories)
  const barData = {
    labels: categories.map((c) => c.category_name),
    datasets: [
      {
        label: "Properties per Category",
        data: categories.map((c) => c.total),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Revenue chart (vertical bar)
  const revenueData = {
    labels: revenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue",
        data: revenue.map((r) => r.total),
        backgroundColor: "rgba(252, 0, 0, 0.8)",
        borderColor: "rgba(22, 252, 34, 0.8)",
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />
        <main className="mt-8">
          <div className="flex flex-col gap-6">
            {/* Info cards */}
            <div className="flex flex-row gap-6">
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <FaHome size={26} /> Total Properties
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">
                  {header.totalProperties}
                </p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <FaUser size={26} /> Total Users
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">
                  {header.totalUsers}
                </p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <RiAuctionFill size={26} /> Current Biddings
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">
                  {header.totalCurrentAuctions}
                </p>
              </div>
              <div className="p-8 shadow border border-gray-300 rounded-3xl w-1/4 h-[180px]">
                <p className="text-lg text-gray-500 flex items-center gap-2">
                  <BiSolidCategory size={26} /> Total Categories
                </p>
                <p className="text-4xl font-sans font-semibold mt-10">
                  {header.totalCategories}
                </p>
              </div>
            </div>

            {/* 2 charts aside */}
            <div className="flex flex-row gap-6">
              <div className="p-4 shadow border border-gray-300 rounded-3xl w-1/2">
                <Pie
                  data={pieData}
                  width={240}
                  height={400}
                  options={{ maintainAspectRatio: false }}
                />
              </div>

              <div className="p-4 shadow border border-gray-300 rounded-3xl w-1/2">
                <Bar
                  data={barData}
                  width={260}
                  height={400}
                  options={{
                    indexAxis: "y" as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "top" as const } },
                    scales: { x: { beginAtZero: true } },
                  }}
                />
              </div>
            </div>

            <div className="p-4 h-[500px] shadow border border-gray-300 rounded-3xl max-w-screen">
              <Chart
                type="treemap"
                data={treemapData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      display: true,
                      formatter: (value: any, ctx: any) => {
                        const data = ctx.dataset.tree[ctx.dataIndex];
                        return `${data.category}\n(${data.value})`;
                      },
                      color: "#fff",
                      font: {
                        size: 12,
                        weight: "bold",
                      },
                      align: "center",
                    },
                  },
                }}
              />
            </div>
            {/* Revenue Chart */}
            <div className="p-4 shadow border border-gray-300 rounded-3xl max-w-screen">
              <Line
                data={revenueData}
                height={500}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  plugins: { legend: { position: "top" as const } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
