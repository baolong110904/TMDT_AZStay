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
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const previewsRef = useRef<string[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  // Track latest previews, and revoke object URLs only once on unmount
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => {
      try {
        previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      } catch {}
    };
  }, []);

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
  setMenuOpenIndex((open) => (open === index ? null : open));
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const nextPreviews = [...previews];
    const nextFiles = [...files];
    const [p] = nextPreviews.splice(index, 1);
    const [f] = nextFiles.splice(index, 1);
    nextPreviews.unshift(p);
    nextFiles.unshift(f);
    setPreviews(nextPreviews);
    setFiles(nextFiles);
    setMenuOpenIndex(null);
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

  // Uploader helper: if persist=true, upload to server; otherwise just confirm selection locally
  const uploadFilesAndMaybeCloseModal = useCallback(async (opts: { closeModal?: boolean; persist?: boolean } = {}) => {
    const { closeModal = false, persist = false } = opts;
    setError(null);
    if (files.length < 5) {
      setError("Please upload at least 5 photos.");
      return false;
    }

    if (!persist) {
      // Local confirm only
      setUploaded(true);
      if (closeModal) setShowModal(false);
      return true;
    }

    if (!propertyId) {
      setError("Missing property_id. Please go back and create a property first.");
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
    // In modal: confirm selection locally; do not persist to server here
    await uploadFilesAndMaybeCloseModal({ closeModal: true, persist: false });
  }, [uploadFilesAndMaybeCloseModal]);

  // drag & drop reorder for review thumbnails
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.closest('[data-nodrag="true"]')) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    try {
      // some browsers require setData for drag to work
      e.dataTransfer.setData("text/plain", String(index));
      // use a transparent drag image to prevent the original element from disappearing
      if (typeof document !== 'undefined') {
        const img = document.createElement('img');
        img.src = TRANSPARENT_GIF;
        e.dataTransfer.setDragImage(img, 0, 0);
      }
    } catch (err) {}
  };

  // Close menu on outside click (pointerdown capture) and Escape
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && el.contains(target)) return; // click inside menu region
      setMenuOpenIndex(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenIndex(null);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // register this page's save handler with the host flow so Layout's Next can trigger it
  const { setOnNext, setCanProceed, setNav } = useHostFlow() as any;
  useEffect(() => {
    const handler = async () => {
  const ok = await uploadFilesAndMaybeCloseModal({ closeModal: true, persist: true });
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
    const data = e.dataTransfer.getData("text/plain");
    const parsed = Number.parseInt(data, 10);
    const from = Number.isFinite(parsed) ? parsed : dragIndex;
    if (from === null || Number.isNaN(from)) return;
    if (from === index) return;
    const next = [...previews];
    const fileNext = [...files];
    const [movedPreview] = next.splice(from, 1);
    const [movedFile] = fileNext.splice(from, 1);
    const to = index > from ? index - 1 : index;
    next.splice(to, 0, movedPreview);
    fileNext.splice(to, 0, movedFile);
    setPreviews(next);
    setFiles(fileNext);
    setDragIndex(null);
  setMenuOpenIndex(null);
  };

  // Allow dropping on the cover area to set an image as cover (move to index 0)
  const onCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const parsed = Number.parseInt(data, 10);
    const from = Number.isFinite(parsed) ? parsed : dragIndex;
    if (from === null || from === 0 || Number.isNaN(from)) return;
    const next = [...previews];
    const fileNext = [...files];
    const [movedPreview] = next.splice(from, 1);
    const [movedFile] = fileNext.splice(from, 1);
    next.unshift(movedPreview);
    fileNext.unshift(movedFile);
    setPreviews(next);
    setFiles(fileNext);
    setDragIndex(null);
  setMenuOpenIndex(null);
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
                        <div
                          key={src} // Ensure all mapped lists use key={src}
                          className="relative rounded-lg overflow-hidden"
                          draggable
                          onDragStart={onDragStart(idx)}
                          onDragOver={onDragOver(idx)}
                          onDrop={onDrop(idx)}
                          onDragEnd={() => setDragIndex(null)}
                        >
                          <img src={src} alt={`preview ${idx + 1}`} className="w-full h-36 object-cover rounded-md" draggable={false} />
                          <button data-nodrag="true" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1">🗑</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && <p className="text-red-500 mt-4">{error}</p>}
                </div>

                <div className="flex items-center justify-between p-4">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2">Done</button>
                  <div>
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
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ta-da! How does this look?</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full mt-2 mr-8 border-gray-500 shadow bg-white text-gray-700 hover:bg-gray-50"
              title="Add photos"
            >
              ＋
            </button>
          </div>
          <div className="text-sm text-gray-500 mb-4">Drag to reorder</div>

          <div className="bg-white rounded-lg p-4">
            {/* cover */}
            <div className="relative rounded-lg overflow-hidden mb-4"
                 onDragOver={onCoverDragOver}
                 onDrop={onCoverDrop}
            >
              <img src={previews[0]} alt="cover" className="w-full h-80 object-cover rounded-md" draggable={false} />
              <div className="absolute top-4 left-4 bg-white text-sm px-2 py-1 rounded shadow z-10">Cover Photo</div>
            </div>

            {/* thumbnails (exclude cover to avoid duplicate DOM node) */}
            <div className="grid grid-cols-3 gap-4">
              {previews.slice(1).map((src, idx) => {
                const realIndex = idx + 1;
                return (
                  <div
                    key={src}
                    onDragOver={onDragOver(realIndex)}
                    onDrop={onDrop(realIndex)}
                    className="relative group"
                  >
                    <img src={src} alt={`preview ${realIndex + 1}`} className="w-full h-36 object-cover rounded-md" draggable={false} />

                  {/* drag handle */}
                  <button
                    type="button"
                    title="Drag to reorder"
                    draggable
                    onDragStart={onDragStart(realIndex)}
                    className="absolute bottom-2 left-2 rounded-md bg-white/90 border shadow px-2 py-1 text-xs text-gray-700 hover:bg-white cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                  >
                    ↕ Drag
                  </button>

                  {/* menu trigger + dropdown */}
                  <div className="absolute top-2 right-2" ref={menuOpenIndex === realIndex ? menuRef : null}>
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={menuOpenIndex === realIndex}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenIndex((open) => (open === realIndex ? null : realIndex));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      data-nodrag="true"
                      className="bg-white rounded-full p-1 shadow border text-gray-700 hover:bg-gray-50"
                    >
                      ⋯
                    </button>
                    {menuOpenIndex === realIndex && (
                      <div
                        role="menu"
                        className="absolute mt-2 right-0 z-20 bg-white border rounded-md shadow-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAsCover(realIndex)}
                        >
                          Set as cover
                        </button>
                        <button
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => removeImage(realIndex)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );})}

              {/* Add-tile: same size as thumbnails, click or drop to add more images */}
              <button
                type="button"
                className="w-full h-36 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const incoming = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
                  if (incoming.length) addFiles(incoming);
                }}
              >
                <span className="text-2xl">＋</span>
              </button>
            </div>

            {/* Navigation handled by layout's Next (registered via setOnNext) */}
          </div>
        </div>
      )}

    </div>
  );
}
