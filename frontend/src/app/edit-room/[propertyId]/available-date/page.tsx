"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function AvailableDatePage() {
	const params = useParams();
	const router = useRouter();
	const propertyId = (params as any)?.propertyId as string;

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [checkin, setCheckin] = useState<string>("");
	const [checkout, setCheckout] = useState<string>("");

	useEffect(() => {
		if (!propertyId) return;
		(async () => {
			try {
				setLoading(true);
				const res = await api.get(`/properties/${propertyId}`);
				const data = res.data?.data ?? res.data ?? {};
				const ci = data.checkin_date ? fmtDateInput(new Date(data.checkin_date)) : defaultDate(1);
				const co = data.checkout_date ? fmtDateInput(new Date(data.checkout_date)) : defaultDate(4);
				setCheckin(ci);
				setCheckout(co);
			} catch (e: any) {
				setError(e?.response?.data?.message || e.message || "Failed to load property");
			} finally {
				setLoading(false);
			}
		})();
	}, [propertyId]);

	const canSave = useMemo(() => {
		if (!checkin || !checkout) return false;
		const ci = new Date(checkin);
		const co = new Date(checkout);
		return ci < co;
	}, [checkin, checkout]);

	async function handleSave() {
		if (!propertyId) return;
		if (!canSave) {
			alert("Please select a valid date range.");
			return;
		}
		try {
			setSaving(true);
			setError(null);
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			await api.patch(
				`/properties/${propertyId}`,
				{
					checkin_date: new Date(checkin).toISOString(),
					checkout_date: new Date(checkout).toISOString(),
				},
				{ headers: token ? { Authorization: `Bearer ${token}` } : undefined }
			);
			alert("Saved available date");
			router.refresh?.();
		} catch (e: any) {
			setError(e?.response?.data?.message || e.message || "Failed to save");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="min-h-[90vh] bg-white">
			<div className="mx-auto max-w-3xl px-6 py-10">
				<h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Available date</h1>
				{error && <div className="mt-3 text-sm text-red-600">{error}</div>}
				{loading ? (
					<div className="mt-2 text-gray-500 text-sm">Loading…</div>
				) : (
					<div className="mt-8 rounded-2xl border border-gray-200 p-6 shadow-sm">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<LabeledDate label="Check-in" value={checkin} onChange={setCheckin} />
							<LabeledDate label="Check-out" value={checkout} onChange={setCheckout} min={checkin} />
						</div>
						<div className="mt-6">
							<button
								onClick={handleSave}
								disabled={!canSave || saving}
								className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
									!canSave || saving
										? "bg-indigo-300 cursor-not-allowed"
										: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
								}`}
							>
								{saving ? "Saving…" : "Save"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function LabeledDate({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
	return (
		<div>
			<label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
			<input
				type="date"
				value={value}
				min={min}
				onChange={(e) => onChange(e.target.value)}
				className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>
	);
}

function fmtDateInput(d: Date) {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function defaultDate(offsetDays: number) {
	const d = new Date();
	d.setDate(d.getDate() + offsetDays);
	return fmtDateInput(d);
}
