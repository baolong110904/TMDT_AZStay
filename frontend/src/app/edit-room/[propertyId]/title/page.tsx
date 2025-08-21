"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import api from '@/lib/axios';

export default function TitlePage() {
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`properties/${propertyId}`);
        const data = res.data?.data ?? res.data;
        setTitle(data?.title ?? '');
      } catch (err: any) {
        console.error('Failed to fetch title', err);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch title');
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const save = async () => {
    try {
      setLoading(true);
      await api.patch(`properties/${propertyId}`, { title });
      window.alert('Title saved');
    } catch (err: any) {
      console.error('Save failed', err);
      setError(err?.response?.data?.message || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const max = 50;
  const remaining = Math.max(0, max - (title?.length ?? 0));

  return (
    <div className="min-h-[90vh] pt-6 flex flex-col items-center justify-start relative">
      <div className="w-full max-w-4xl">
        {loading && <div className="mb-4">Loading...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="text-center text-sm text-gray-500 mb-6 flex justify-center items-center">{`${title.length}/${max} available`}</div>

        <div className="flex items-center justify-center">
          <textarea
            rows={1}
            maxLength={max}
            className="w-full text-center resize-none outline-none bg-transparent placeholder-gray-400 text-6xl md:text-3xl font-bold leading-tight mx-auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write a short, descriptive title for your listing"
          />
        </div>

        {/* bottom area: separator line, tip bulb, and save button */}
        <div className="relative mt-130">
          <div className="absolute left-0 right-0 bottom-16 h-px bg-gray-300" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-15 transform -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
              <LightBulbIcon className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          <div className="absolute right-0 bottom-0">
            <button
              onClick={save}
              disabled={loading}
              className={`rounded px-4 py-2 ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}