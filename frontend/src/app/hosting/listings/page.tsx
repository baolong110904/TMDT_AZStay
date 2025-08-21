"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/SubHeader";

type Property = {
	property_id: string;
	title: string;
	address: string | null;
	ward?: string | null;
	province?: string | null;
	country?: string | null;
	cover_image?: string | null;
	max_guest?: number | null;
	min_price?: number | null;
	// add is_available since UI expects it
	is_available?: boolean | null;
	propertyimage?: {
		image_id: string;
		property_id: string;
		image_url: string;
		is_cover: boolean;
		uploaded_at: string;
	}[];
};

export default function HostingListingsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const paramUserId = searchParams?.get("userId");
	const storageUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
	const userId = (paramUserId ?? storageUserId) || "";

	const [loading, setLoading] = useState(false);
	const [properties, setProperties] = useState<Property[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) return;
		const fetch = async () => {
			try {
				setLoading(true);
				const res = await api.get("properties/get-property-by-user-id", { params: { user_id: userId } });
				setProperties(res.data.data || []);
			} catch (err: any) {
				console.error("Failed to load listings error:", err);
				// show server-provided message if any
				const serverMsg = err?.response?.data?.message || err?.response?.data || err.message;
				setError(serverMsg || "Failed to load listings");
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [userId]);

	return (
		<>
			<Header />
			<div className="max-w-7xl mx-auto py-12 px-6">
			<h1 className="text-3xl font-bold mb-6">Your listings</h1>

			{loading && <div>Loading...</div>}
			{error && <div className="text-red-500">{error}</div>}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{properties.map((p) => (
					<div key={p.property_id} onClick={() => router.push(`/edit-room/${p.property_id}`)} role="button" tabIndex={0} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer" onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/edit-room/${p.property_id}`); }}>
						<div className="h-64 bg-gray-200 w-full relative">
							{(() => {
								// prefer explicit cover_image, else propertyimage with is_cover, else first image
								const cover = p.cover_image ?? p.propertyimage?.find((pi) => pi.is_cover)?.image_url ?? p.propertyimage?.[0]?.image_url ?? null;
								if (cover) {
									return <img src={cover} alt={p.title} className="w-full h-full object-cover" />;
								}
								return <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>;
							})()}
							<div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 text-sm shadow">{p.is_available ? 'Available' : 'Action required'}</div>
						</div>

						<div className="p-4">
							<h2 className="font-semibold text-lg">{p.title}</h2>
							<div className="text-sm text-gray-500 mt-1">{p.address || ''}{p.province ? `, ${p.province}` : ''}{p.country ? `, ${p.country}` : ''}</div>
								<div className="mt-3 flex items-center justify-between">
								<div className="text-sm">Max guests: <span className="font-semibold">{p.max_guest ?? 1}</span></div>
								<div className="text-lg font-bold">₫{Number(p.min_price ?? 0).toLocaleString()}</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{!loading && properties.length === 0 && <div className="text-gray-500 mt-6">You do not have any listings yet.</div>}
			</div>
		</>
	);

}
