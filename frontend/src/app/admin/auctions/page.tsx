"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";
import AdminHeader from "@/components/AdminHeader";
import api from "@/lib/axios";

interface Auction {
  auction_id: string;
  status: string;
  start_time: string;
  end_time: string;
  final_price: string | null;
  property: {
    title: string;
    address: string | null;
    min_price: string | null;
    country: string | null;
  };
}

export default function AuctionAdminPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
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

  // fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get("/admin/get-active-auction");
        setAuctions(res.data);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      }
    };
    fetchAuctions();
  }, []);

  // pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = auctions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(auctions.length / itemsPerPage);

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />
        
        <h1 className="text-3xl font-bold mb-4">Active Auctions</h1>

        {/* Rounded table wrapper */}
        <div className="overflow-hidden rounded-3xl border border-gray-300">
          <table className="w-full">
            <thead>
              <tr className="bg-emerald-100 text-left">
                <th className="p-2 ">No</th>
                <th className="p-2 ">Property</th>
                <th className="p-2">Address</th>
                <th className="p-2">Start Time</th>
                <th className="p-2">End Time</th>
                <th className="p-2">Min Price</th>
                <th className="p-2">Final Price</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((auction, idx) => (
                <tr key={auction.auction_id} className="hover:bg-gray-50">
                  {/* Correct row number across pagination */}
                  <td className="p-2">{indexOfFirst + idx + 1}</td>
                  <td className="p-2">{auction.property?.title || "No Title"}</td>
                  <td className="p-2">{auction.property?.address || "N/A"}</td>
                  <td className="p-2">{new Date(auction.start_time).toLocaleString()}</td>
                  <td className="p-2">{new Date(auction.end_time).toLocaleString()}</td>
                  <td className="p-2">
                    {auction.property?.min_price ? `${auction.property.min_price} đ` : "N/A"}
                  </td>
                  <td className="p-2">
                    {auction.final_price ? `${auction.final_price} đ` : "Pending"}
                  </td>
                  <td className="p-2 font-semibold">{auction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded-3xl disabled:opacity-50 hover:bg-amber-100 cursor-pointer"
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border border-b-neutral-700 rounded-3xl disabled:opacity-50 hover:bg-amber-100 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}