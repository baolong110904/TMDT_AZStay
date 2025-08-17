"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";

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
};

export default function HostingListingsPage() {
	const searchParams = useSearchParams();
	const userId = (searchParams?.get("userId") ?? (typeof window !== "undefined" ? localStorage.getItem("userId") : null)) || "";

	const [loading, setLoading] = useState(false);
	const [properties, setProperties] = useState<Property[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) return;
		const fetch = async () => {
			try {
				setLoading(true);
				const res = await api.post("/properties/get-property-by-user-id", { user_id: userId });
				setProperties(res.data.data || []);
			} catch (err: any) {
				console.error(err);
				setError(err?.response?.data?.message || "Failed to load listings");
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [userId]);

	return (
		<div className="max-w-7xl mx-auto py-12 px-6">
			<h1 className="text-3xl font-bold mb-6">Your listings</h1>

			{loading && <div>Loading...</div>}
			{error && <div className="text-red-500">{error}</div>}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{properties.map((p) => (
					<div key={p.property_id} className="bg-white rounded-lg shadow overflow-hidden">
						<div className="h-64 bg-gray-200 w-full relative">
							{p.cover_image ? (
								// assume cover_image is a URL
								// use img instead of next/image for simplicity
								<img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
							)}
							<div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 text-sm shadow">{p.is_available ? 'In progress' : 'Action required'}</div>
						</div>

						<div className="p-4">
							<h2 className="font-semibold text-lg">{p.title}</h2>
							<div className="text-sm text-gray-500 mt-1">{p.address || ''}{p.province ? `, ${p.province}` : ''}{p.country ? `, ${p.country}` : ''}</div>
							<div className="mt-3 flex items-center justify-between">
								<div className="text-sm">Max guests: <span className="font-semibold">{p.max_guest ?? 1}</span></div>
								<div className="text-lg font-bold">₫{(p.min_price ?? 0).toLocaleString()}</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{!loading && properties.length === 0 && <div className="text-gray-500 mt-6">You do not have any listings yet.</div>}
		</div>
	);
}
