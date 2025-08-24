"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { PlusIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/lib/axios";

type Photo = {
  id: string; // existing image_id or synthetic id for new
  src: string; // url or blob url
  file?: File; // present for new uploads
  existing?: boolean; // true if already on server
};

export default function AdditionalPhotosPage() {
  const params = useParams();
  const propertyId = (params as any)?.propertyId as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Open native file picker
  const openPicker = () => inputRef.current?.click();

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const next = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      src: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...next, ...prev]);
    // Reset the input so the same files can be reselected
    e.target.value = "";
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.src.startsWith("blob:")) URL.revokeObjectURL(p.src);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p?.src.startsWith("blob:")) URL.revokeObjectURL(p.src);
      return prev.filter((x) => x.id !== id);
    });
    // mark for deletion if it's an existing server image
    setToDelete((prev) => (photos.find((p) => p.id === id && p.existing) ? [...prev, id] : prev));
  };

  // Load existing images from backend
  useEffect(() => {
    if (!propertyId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
  const res = await api.get(`properties/${propertyId}/images`);
        const data = res.data?.data ?? res.data ?? [];
        const mapped: Photo[] = (data || []).map((img: any) => ({
          id: img.image_id,
          src: img.image_url,
          existing: true,
        }));
        setPhotos(mapped);
      } catch (err: any) {
        console.error("Failed to load images", err);
        setError(err?.response?.data?.message || err.message || "Failed to load images");
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  const newFiles = useMemo(() => photos.filter((p) => !p.existing && p.file), [photos]);

  const save = async () => {
    if (!propertyId) return;
    try {
      setSaving(true);
      setError(null);
      // Upload new files
      if (newFiles.length) {
        const form = new FormData();
        form.append("property_id", propertyId);
        newFiles.forEach((p) => p.file && form.append("images", p.file));
  await api.post(`properties/upload-images`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // Delete removed existing images
      for (const id of toDelete) {
        try {
          await api.delete(`properties/images/${id}`);
        } catch (e) {
          console.error("Failed to delete image", id, e);
        }
      }
      // Refresh
  const res = await api.get(`properties/${propertyId}/images`);
      const data = res.data?.data ?? res.data ?? [];
      const mapped: Photo[] = (data || []).map((img: any) => ({
        id: img.image_id,
        src: img.image_url,
        existing: true,
      }));
      setPhotos(mapped);
      setToDelete([]);
      if (inputRef.current) inputRef.current.value = "";
      window.alert("Saved images");
    } catch (err: any) {
      console.error("Save failed", err);
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Additional photos
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={openPicker}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <PhotoIcon className="h-5 w-5" />
              Manage photos
            </button>

            <button
              onClick={openPicker}
              aria-label="Add photo"
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-indigo-600 shadow ring-1 ring-inset ring-black/5 transition hover:shadow-md"
            >
              <PlusIcon className="h-6 w-6" />
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesPicked}
              className="hidden"
            />
          </div>
        </div>

  {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

  <p className="mt-3 max-w-2xl text-base text-gray-600">
          These photos aren’t included in a room or space, but they’ll still
          appear in your listing.
        </p>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <img
                src={p.src}
                alt="additional photo"
                className="aspect-square h-full w-full object-cover"
                loading="lazy"
              />

              {/* Remove button on hover */}
              <button
                onClick={() => removePhoto(p.id)}
                className="absolute right-3 top-3 hidden rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur group-hover:block hover:text-red-600"
                aria-label="Remove photo"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              saving
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110"
            }`}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

