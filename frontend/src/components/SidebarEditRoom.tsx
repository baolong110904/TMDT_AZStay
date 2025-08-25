"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import api from '@/lib/axios';
import SettingSidebar from './SidebarSettingRoom';

type Props = {
  basePath: string;
  currentSection?: string;
  property?: any;
};

export default function SidebarEditRoom({ basePath, currentSection = "", property }: Props) {
  const router = useRouter();
  const activeSection = currentSection;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localProperty, setLocalProperty] = useState<any>(property ?? null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  const [showSetting, setShowSetting] = useState(false);

  // Resolve userId from URL > localStorage('userId' or JSON 'user'.user_id) > referrer > property
  const resolveUserId = (): string => {
    // 1) URL query
    const qUserId = searchParams?.get('userId');
    if (qUserId) return qUserId;

    // 2) localStorage
    if (typeof window !== 'undefined') {
      const lsUserId = localStorage.getItem('userId');
      if (lsUserId) return lsUserId;
      // Try JSON user object
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const cand = parsed?.user_id || parsed?.id || parsed?.userId || parsed?.uid;
          if (cand && typeof cand === 'string') return cand;
        } catch {}
      }
    }

    // 3) referrer
    if (typeof document !== 'undefined' && document.referrer) {
      try {
        const ref = document.referrer;
        const qIdx = ref.indexOf('?');
        if (qIdx !== -1) {
          const params = new URLSearchParams(ref.substring(qIdx));
          const refUserId = params.get('userId');
          if (refUserId) return refUserId;
        }
      } catch {}
    }

    // 4) fallback to property owner fields if present
    const propUser = (localProperty as any)?.user_id || (localProperty as any)?.owner_id || (localProperty as any)?.host_id;
    if (propUser && typeof propUser === 'string') return propUser;

    return '';
  };

  useEffect(() => {
    if (property) return; // already provided
    if (!pathname) return;

    const m = pathname.match(/\/edit-room\/([^/]+)/);
    const inferred = m?.[1];
    if (!inferred) return;

    const fetchProperty = async (id: string) => {
      try {
        setLoadingProperty(true);
        const res = await api.get(`properties/${id}`);
        const data = res.data?.data ?? res.data;
        setLocalProperty(data);
      } catch (e: any) {
        setPropertyError(e?.response?.data?.message || e.message || 'Failed to load property');
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty(inferred);
  }, [pathname, property]);

  // Close settings only when route changes between sections
  useEffect(() => {
    setShowSetting(false);
  }, [pathname]);

  const handleBack = () => {
    const userId = resolveUserId();

    const pid = localProperty?.property_id ?? property?.property_id ?? '';

    if (userId) {
      const dest = `/hosting/listings?userId=${encodeURIComponent(String(userId))}`;
      // Preserve property_id only when going back from editor, not after deletion
      const url = pid ? `${dest}&property_id=${encodeURIComponent(String(pid))}` : dest;
      router.push(url);
      return;
    }

    // 3) last resort: navigate back in history (preserves query if coming from listings)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    // 4) fallback to listings without userId
    router.push('/hosting/listings');
  };

  if (loadingProperty) {
    return (
      <aside className="bg-white rounded p-4 sticky top-6 h-[90vh]">
        <div className="h-full flex items-center justify-center text-gray-600">
          <span className="inline-flex items-center gap-1">
            Loading
            <span className="inline-block w-3 text-center animate-pulse">.</span>
            <span className="inline-block w-3 text-center animate-pulse [animation-delay:150ms]">.</span>
            <span className="inline-block w-3 text-center animate-pulse [animation-delay:300ms]">.</span>
          </span>
        </div>
      </aside>
    );
  }

  if (propertyError) {
    return <aside className="bg-white rounded p-4 sticky top-6 h-[90vh]">Error: {propertyError}</aside>;
  }

  const latitude = localProperty?.latitude ?? localProperty?.lat ?? localProperty?.latlng?.lat ?? 0;
  const longitude = localProperty?.longitude ?? localProperty?.lng ?? localProperty?.latlng?.lng ?? 0;
  const delta = 0.005; // Small area around the point

  return (
    <aside className="bg-white rounded p-4 sticky top-6 h-[90vh]">
      {/* Right vertical divider */}
      <div aria-hidden className="absolute top-0 right-0 w-px h-full bg-gray-200" />
      <div className="sticky top-10 bg-white z-10 pt-2">
        {/* center block: back button (left), centered title + pills, settings (right) */}
        <div className="relative mb-6">
          <button aria-label="Back to listings" onClick={handleBack} className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center cursor-pointer transition hover:shadow-lg hover:bg-gray-100 text-gray-700 hover:text-black">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold">Listing editor</h3>

            <div className="mt-3 flex items-center gap-3">
              <div className="bg-white rounded-full shadow px-1 py-1 flex items-center gap-2">
                <Link
                  href={`${basePath}/title`}
                  onClick={() => setShowSetting(false)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-150 ${activeSection === "title" ? "bg-white text-black shadow-md" : "text-gray-600 hover:bg-gray-50 hover:shadow-sm"}`}
                >
                  Your space
                </Link>
                <div className="w-px h-5 bg-gray-200 rounded" />
                <Link
                  href={`${basePath}/arrival-guide`}
                  onClick={() => setShowSetting(false)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-150 ${activeSection === "arrival-guide" ? "bg-white text-black shadow-md" : "text-gray-600 hover:bg-gray-50 hover:shadow-sm"}`}
                >
                  Arrival guide
                </Link>
              </div>
              <button
                aria-label="Settings"
                title="Settings"
                className="p-2 rounded-full text-gray-600 hover:bg-gray-50 transition"
                onClick={() => setShowSetting(true)}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSetting ? (
        <SettingSidebar
          property={localProperty}
          onClose={() => setShowSetting(false)}
          onDeleted={() => {
            setShowSetting(false);
            // After deletion, navigate to listings with only userId (no property_id)
            const userId = resolveUserId();
            const dest = userId
              ? `/hosting/listings?userId=${encodeURIComponent(String(userId))}`
              : `/hosting/listings`;
            router.push(dest);
          }}
        />
      ) : (
      <div className="mt-3 overflow-auto h-[calc(80vh-120px)] pr-2">
        <div className="mb-4">
          <Link
            href={`${basePath}/auction`}
            className={`block rounded-xl border border-gray-100 p-3 shadow-sm bg-white hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'auction' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium text-sm text-red-600">● Complete required steps</div>
                <div className="text-sm text-gray-500 mt-2">Finish the auction setup to publish your listing and start getting booked.</div>
              </div>
              <div className="text-gray-400">›</div>
            </div>
          </Link>
        </div>

        <div className="mb-4">
          <Link href={`${basePath}/photo`} className={`block rounded-xl border border-gray-100 p-3 shadow-sm bg-white hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'photo' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold mb-1">Photo tour</div>
            {/* <div className="text-sm text-gray-500 mb-3">{localProperty?.bedroom_count ?? localProperty?.bed_count ? `${localProperty?.bedroom_count ?? '1'} bedroom · ${localProperty?.bed_count ?? '1'} bed · ${localProperty?.bath_count ?? '1'} bath` : '—'}</div> */}
            <div className="rounded-xl overflow-hidden h-44 relative bg-white">
              {/* stacked images */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* left image */}
                {(localProperty?.propertyimage || [])[0] ? (
                  <div className="absolute left-6 transform -rotate-6 w-40 h-28 rounded-2xl overflow-hidden shadow-md bg-center bg-cover" style={{ backgroundImage: `url('${localProperty.propertyimage[0].image_url}')` }} />
                ) : null}

                {/* center image (largest) */}
                {(localProperty?.propertyimage || [])[1] ? (
                  <div className="relative z-20 w-36 h-36 rounded-3xl overflow-hidden shadow-xl ring-2 bg-center bg-cover" style={{ backgroundImage: `url('${localProperty.propertyimage[1].image_url}')` }} />
                ) : (
                  null
                )}

                {/* right image */}
                {(localProperty?.propertyimage || [])[2] ? (
                  <div className="absolute right-6 transform rotate-6 w-40 h-28 rounded-2xl overflow-hidden shadow-md bg-center bg-cover" style={{ backgroundImage: `url('${localProperty.propertyimage[2].image_url}')` }} />
                ) : null}
              </div>

              {/* centered photos count */}
              <div className="absolute top- left-1/2 -translate-x-15 z-20 bg-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md ring-2 ring-white">
                {(localProperty?.propertyimage?.length ?? 0)} photos
              </div>
            </div>
          </Link>
        </div>

        <div className="space-y-4">
          <Link href={`${basePath}/title`} className={`block rounded-xl p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'title' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold">Title</div>
            <div className="text-gray-500 mt-2">{localProperty?.title ?? '—'}</div>
          </Link>

          <Link href={`${basePath}/property-type`} className={`block rounded-xl p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'property-type' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold">Property type</div>
            <div className="text-gray-500 mt-2">{localProperty?.category?.category_name ?? localProperty?.category_id ?? 'Entire place · House'}</div>
          </Link>
          <Link href={`${basePath}/pricing`} className={`block rounded-xl p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'pricing' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold">Pricing</div>
            <div className="text-gray-500 mt-2">
              {`₫${Number(localProperty?.min_price ?? 0).toLocaleString()} per night`}<br/>
              {localProperty?.weekend_price ? `₫${Number(localProperty.weekend_price).toLocaleString()} weekend price` : '₫739,867 weekend price'}<br/>
              {localProperty?.weekly_discount ? `${localProperty.weekly_discount}% weekly discount` : '5% weekly discount'}
            </div>
          </Link>
          <Link href={`${basePath}/available-date`} className={`block rounded-xl p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'available-date' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold">Available date</div>
            <div className="text-gray-500 mt-2">
              <div>Check-in: {localProperty?.checkin_date ? new Date(localProperty.checkin_date).toLocaleDateString() : '—'}</div>
              <div>Check-out: {localProperty?.checkout_date ? new Date(localProperty.checkout_date).toLocaleDateString() : '—'}</div>
            </div>
          </Link>
          <Link href={`${basePath}/guests`} className={`block rounded-xl p-3 bg-white shadow-sm border border-gray-100 hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'guests' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold">Number of guests</div>
            <div className="text-gray-500 mt-2">{localProperty?.max_guest ?? 4} guests</div>
          </Link>
          <Link href={`${basePath}/location`} className={`block rounded-xl border border-gray-100 p-3 shadow-sm bg-white hover:shadow-md mx-auto max-w-[300px] ${activeSection === 'location' ? 'ring-2 ring-gray-200 border-transparent' : ''}`}>
            <div className="text-sm font-bold mb-2">Location</div>
            <div className="rounded-md overflow-hidden bg-gray-100 h-28 mb-3">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.001}%2C${Number(latitude) - 0.001}%2C${Number(longitude) + 0.001}%2C${Number(latitude) + 0.001}&layer=mapnik&marker=${Number(latitude)}%2C${Number(longitude)}&zoom=16`}
                style={{ border: 0 }}
              />
            </div>
            <div className="text-gray-500 text-sm">{localProperty?.address ?? '—'}</div>
          </Link>
      {/* About the host section removed as requested */}
        </div>
      </div>
    )}
    </aside>
  );
}