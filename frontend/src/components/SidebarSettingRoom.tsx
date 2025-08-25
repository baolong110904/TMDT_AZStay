"use client";
import { useState } from "react";
import api from "@/lib/axios";

type Props = {
  property: any;
  onClose: () => void;
  onDeleted: () => void;
};

export default function SettingSidebar({ property, onClose, onDeleted }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/properties/${property?.property_id}`);
      const data = res.data?.data ?? res.data;
      // Assume property has is_available or status field
      setStatus(data?.is_available ? "Available/Listed" : "Action required");
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/properties/${property?.property_id}`);
      onDeleted();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to delete property");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <aside className="bg-white rounded-lg sticky top-6 h-[90vh] w-full max-w-md flex flex-col overflow-hidden">
      {/* Simple header */}
      <div className="p-4 flex-1 space-y-4 overflow-auto">
        {/* Listing status card */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
            <div className="font-medium">Listing status</div>
            <span className={`text-sm ${ (status ?? (property?.is_available ? 'Available/Listed' : 'Action required')) === 'Action required' ? 'text-amber-600' : 'text-green-600' }`}>
              {status ? status : property?.is_available ? 'Available/Listed' : 'Action required'}
            </span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">Refresh status from server</div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-3 py-2 text-sm rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 disabled:opacity-60 flex items-center gap-1"
            >
              {loading ? (
                <span className="inline-flex">
                  Checking
                  <span className="inline-block w-3 text-center animate-pulse">.</span>
                  <span className="inline-block w-3 text-center animate-pulse [animation-delay:150ms]">.</span>
                  <span className="inline-block w-3 text-center animate-pulse [animation-delay:300ms]">.</span>
                </span>
              ) : 'Check now'}
            </button>
          </div>
        </div>

        {/* Remove listing card */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
            <div className="font-medium">Remove listing</div>
          </div>
          <div className="p-4 space-y-3">
            {!showConfirm ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Permanently remove your listing.</div>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-3 py-2 text-sm rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
                >
                  Remove listing
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="text-sm font-medium text-amber-700 mb-2">Confirm deletion</div>
                <div className="text-sm text-amber-800 mb-3">Are you sure you want to permanently delete this property?</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-1"
                  >
                    {loading ? (
                      <span className="inline-flex">
                        Deleting
                        <span className="inline-block w-3 text-center animate-pulse">.</span>
                        <span className="inline-block w-3 text-center animate-pulse [animation-delay:150ms]">.</span>
                        <span className="inline-block w-3 text-center animate-pulse [animation-delay:300ms]">.</span>
                      </span>
                    ) : 'Delete'}
                  </button>
                </div>
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
              </div>
            )}
          </div>
        </div>

        {error && !showConfirm && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </div>
    </aside>
  );
}