"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "@/components/Admin/SidebarAdmin";
import AdminHeader from "@/components/AdminHeader";
import api from "@/lib/axios";

type User = {
  user_id: string;
  name: string;
  email: string;
  role_id: number;
  is_banned: boolean;
};

// Helper to map role_id to readable string
const getRoleLabel = (role_id: number): string => {
  switch (role_id) {
    case 2:
      return "Customer";
    case 3:
      return "Host";
    case 4:
      return "Customer + Host";
    default:
      return "Unknown";
  }
};

export default function UserManagementPage() {
  const [userRole, setUserRole] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(""); // input value
  const [query, setQuery] = useState(""); // actual applied query

  const router = useRouter();

  // Check role
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

  // Fetch users
  const fetchUsers = async (page: number, query: string) => {
    setLoading(true);
    try {
      if (query && query.trim() !== "") {
        // search API
        const res = await api.get("/admin/search-user", {
          params: { query, page, limit: 10 },
        });
        setUsers(res.data.data.userData);
        setTotalPages(res.data.data.totalPages);
      } else {
        // normal fetch
        const res = await api.post("/admin/get-user", { page });
        setUsers(res.data.data.userData);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, query);
  }, [page, query]);

  // Change role
  const handleChangeRole = async (user_id: string, newRole: string) => {
    try {
      await api.post("/admin/change-role", { user_id, desire_role: newRole });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user_id
            ? {
                ...u,
                role_id: newRole === "customer" ? 2 : 4, // map back to role_id
              }
            : u
        )
      );
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  // Change ban status
  const handleChangeBan = async (user_id: string, status: boolean) => {
    try {
      await api.post("/admin/change-ban", { user_id, status });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user_id ? { ...u, is_banned: status } : u
        )
      );
    } catch (err) {
      console.error("Failed to change ban:", err);
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset to first page
    setQuery(search);
  };

  return (
    <div className="min-h-screen max-w-screen bg-white flex">
      <SidebarAdmin user={{ name: "Admin", avatar: "" }} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <AdminHeader />

        <h1 className="text-3xl font-bold mb-4">User Management</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border border-b-neutral-700 rounded-3xl px-4 py-2"
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white px-4 py-2 rounded-3xl hover:bg-emerald-600"
          >
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setQuery("");
                setPage(1);
              }}
              className="bg-gray-300 px-4 py-2 rounded-3xl hover:bg-gray-400"
            >
              Reset
            </button>
          )}
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-100 text-center">
                  <th className="p-2">No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Ban Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-50 text-center"
                  >
                    <td className="p-2">{(page - 1) * 10 + idx + 1}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{getRoleLabel(user.role_id)}</td>
                    <td className="p-2 font-medium">
                      {user.is_banned ? "Banned" : "Active"}
                    </td>
                    <td className="p-2 space-x-2">
                      {/* Change Role */}
                      <select
                        value={getRoleLabel(user.role_id)}
                        onChange={(e) =>
                          handleChangeRole(user.user_id, e.target.value)
                        }
                        className="border p-1 rounded-3xl"
                      >
                        <option value="customer">Customer</option>
                        <option value="both">Both</option>
                      </select>

                      {/* Change Ban */}
                      <button
                        onClick={() =>
                          handleChangeBan(user.user_id, !user.is_banned)
                        }
                        className={`px-3 py-1 rounded-3xl text-white hover:opacity-90 ${
                          user.is_banned ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {user.is_banned ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded-3xl disabled:opacity-50 hover:bg-amber-100 cursor-pointer"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border border-b-neutral-700 rounded-3xl disabled:opacity-50 hover:bg-amber-100 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
