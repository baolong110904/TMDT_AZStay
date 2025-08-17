"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import cameraImg from "@/assets/camera.png";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useHostFlow } from "@/components/HostFlowProvider";

export default function PhotoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams?.get("property_id") ?? undefined;
  const userId = searchParams?.get("userId") ?? undefined;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAddPhotosClick = () => {
    // open file picker from modal only
    fileInputRef.current?.click();
  };

  const addFiles = (incoming: File[]) => {
    const selected = incoming;
    if (!selected.length) return;
    const combined = [...files, ...selected].slice(0, 20);
    setFiles(combined);
    const urls = combined.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    // reset native input so selecting same files again will fire change
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    // cleanup object URLs on unmount
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const incoming = Array.from(e.target.files || []);
    addFiles(incoming);
  };

  const removeImage = (index: number) => {
  const nextFiles = files.filter((_, i) => i !== index);
  // revoke the URL for removed preview
  const removedUrl = previews[index];
  try { URL.revokeObjectURL(removedUrl); } catch (e) {}
  const nextPreviews = previews.filter((_, i) => i !== index);
  setFiles(nextFiles);
  setPreviews(nextPreviews);
  };

  // drag state
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDropAreaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };
  const handleDropAreaDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDropAreaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const incoming = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (incoming.length) addFiles(incoming);
  };

  // shared upload function used by modal Upload and Next button
  const uploadFilesAndMaybeCloseModal = useCallback(async (closeModal = false) => {
    setError(null);
    if (!propertyId) {
      setError("Missing property_id. Please go back and create a property first.");
      return false;
    }
    if (files.length < 5) {
      setError("Please upload at least 5 photos.");
      return false;
    }

    const form = new FormData();
    form.append("property_id", propertyId);
    if (userId) form.append("user_id", userId);
    files.forEach((f) => form.append("images", f));

    try {
      setIsUploading(true);
      await api.post("/properties/upload-images", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // success — show review UI using local previews (order preserved)
      setUploaded(true);
      if (closeModal) setShowModal(false);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Upload failed");
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [files, propertyId, userId]);

  const handleUpload = useCallback(async () => {
    // delegate to shared uploader so modal's Upload button still works
    await uploadFilesAndMaybeCloseModal(true);
  }, [uploadFilesAndMaybeCloseModal]);

  // drag & drop reorder for review thumbnails
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      // some browsers require setData for drag to work
      e.dataTransfer.setData("text/plain", String(index));
    } catch (err) {}
  };

  // register this page's save handler with the host flow so Layout's Next can trigger it
  const { setOnNext, setCanProceed, setNav } = useHostFlow() as any;
  useEffect(() => {
    const handler = async () => {
      const ok = await uploadFilesAndMaybeCloseModal(true);
      if (!ok) {
        alert('Failed to save photos');
        return;
      }
      alert('Saved');
      if (propertyId) {
        router.push(`/become-a-host/${userId}/price?property_id=${encodeURIComponent(String(propertyId))}`);
      } else {
        router.push(`/become-a-host/${userId}/price`);
      }
    };
    if (setOnNext) setOnNext(() => handler);
    return () => {
      try {
        if (setOnNext) setOnNext(null);
      } catch {}
    };
    // we intentionally depend on files/previews so the latest data is used when Next is clicked
  }, [setOnNext, files, previews, propertyId, userId, router, uploadFilesAndMaybeCloseModal]);

  // update host flow nav and whether Next can be clicked
  useEffect(() => {
    try {
      setNav({ next: `/become-a-host/${userId}/price${propertyId ? `?property_id=${encodeURIComponent(String(propertyId))}` : ''}`, prev: `/become-a-host/${userId ?? ''}/standout`, currentStep: 6, totalSteps: 7 });
    } catch {}
    try {
      setCanProceed(Boolean(files.length >= 5));
    } catch {}
  }, [files.length, userId, propertyId, setNav, setCanProceed]);
  const onDragEnter = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    const next = [...previews];
    const fileNext = [...files];
    const [movedPreview] = next.splice(dragIndex, 1);
    const [movedFile] = fileNext.splice(dragIndex, 1);
    next.splice(index, 0, movedPreview);
    fileNext.splice(index, 0, movedFile);
    setPreviews(next);
    setFiles(fileNext);
    setDragIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {!uploaded && (
  <>
  <h1 className="text-2xl font-semibold mb-2">Add some photos of your property</h1>
  <p className="text-gray-500 mb-6">You will need 5 photos to get started. You can add more or make changes later.</p>

          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center bg-gray-50">
            <Image src={cameraImg} alt="camera" width={96} height={96} />
            <div className="mt-6">
              <button onClick={() => { setShowModal(true); }} className="px-4 py-2 border rounded-md bg-white shadow-sm">
                Add photos
              </button>
            </div>
          </div>

          {/* Modal upload UI */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
              <div className="relative w-[90%] max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden h-[80vh] flex flex-col">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Upload photos</div>
                    <div className="text-sm opacity-90">{files.length} items selected</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full bg-white/20 text-white" onClick={() => { setShowModal(false); }}>{/* close */}✕</button>
                    <button className="w-9 h-9 rounded-full bg-white/20 text-white" onClick={() => fileInputRef.current?.click()}>＋</button>
                  </div>
                </div>

                <div className="p-6 overflow-auto flex-1">
                  {/* drag/drop area */}
                  <div onDragOver={handleDropAreaDragOver} onDragEnter={handleDropAreaDragOver} onDragLeave={handleDropAreaDragLeave} onDrop={handleDropAreaDrop} className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center text-gray-600 ${isDragOver ? 'border-blue-400 bg-blue-50' : ''}`}>
                    <div className="mb-4">
                      <Image src={cameraImg} alt="camera" width={64} height={64} />
                    </div>
                    <div className="text-xl font-medium mb-1">Drag and drop</div>
                    <div className="text-sm mb-4">or browse for photos</div>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-500 text-white px-5 py-2 rounded">Browse</button>
                  </div>

                  {/* thumbnails grid */}
                  {previews.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-4 max-h-96 overflow-auto">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden" draggable onDragStart={onDragStart(idx)} onDragOver={onDragOver(idx)} onDrop={onDrop(idx)}>
                          <img src={src} alt={`preview ${idx + 1}`} className="w-full h-36 object-cover rounded-md" />
                          <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1">🗑</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>

                <div className="flex items-center justify-between p-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2">Done</button>
                  <div>
                    <button onClick={() => { setFiles([]); previews.forEach(u=>URL.revokeObjectURL(u)); setPreviews([]); }} className="mr-3 px-4 py-2">Clear</button>
                    <button disabled={files.length < 5 || isUploading} onClick={handleUpload} className={`px-4 py-2 rounded ${files.length < 5 || isUploading ? 'bg-gray-300 text-gray-600' : 'bg-black text-white'}`}>
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

  {/* hidden file input always available so review '+' can open picker */}
  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />

      {/* After upload: review & reorder */}
      {uploaded && previews.length > 0 && (
        <div className="-mt-10">
          <h2 className="text-xl font-semibold mb-2">Ta-da! How does this look?</h2>
          <div className="text-sm text-gray-500 mb-4">Drag to reorder</div>

          <div className="bg-white rounded-lg p-4">
            {/* cover */}
            <div className="relative rounded-lg overflow-hidden mb-4">
              <img src={previews[0]} alt="cover" className="w-full h-80 object-cover rounded-md" />
              <div className="absolute top-4 left-4 bg-white text-sm px-2 py-1 rounded shadow z-10">Cover Photo</div>
            </div>

            {/* thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {previews.map((src, idx) => (
                <div key={idx} draggable onDragStart={onDragStart(idx)} onDragOver={onDragOver(idx)} onDrop={onDrop(idx)} className="relative">
                  <img src={src} alt={`uploaded ${idx + 1}`} className="w-full h-36 object-cover rounded-md" />
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">⋯</div>
                </div>
              ))}
            </div>

            {/* Navigation handled by layout's Next (registered via setOnNext) */}
          </div>
        </div>
      )}

    </div>
  );
}
