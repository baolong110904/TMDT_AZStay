"use client";

import { useState, useEffect, Key } from "react";
import { RiCloseFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

interface ImagePreviewProps {
  imgUrls: string[];
}

export default function ImagePreview({ imgUrls }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.addEventListener("keydown", keyDown);
    }
    
    return () => {
      document.removeEventListener("keydown", keyDown);
    };

  }, [isModalOpen]);

  return (
    <div>
      {/* Preview Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Ảnh lớn (bên trái) */}
        <div onClick={openModal} className="col-span-2 cursor-pointer">
          <img
            src={imgUrls[0]}
            alt="Preview 0"
            className="w-full h-[500px] object-cover rounded-xl"
          />
        </div>

        {/* 4 ảnh nhỏ bên phải */}
        <div className="col-span-2 grid grid-cols-2 grid-rows-2 gap-2">
          {imgUrls.slice(1, 5).map((item, index) => (
            <div key={index} onClick={openModal} className="cursor-pointer">
              <img
                src={item}
                alt={`Preview ${index + 1}`}
                className="w-full h-[246px] object-cover rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal (scrollable + framer motion) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-white bg-opacity-80 overflow-y-auto z-50">
            <div className="pt-20 pb-10 flex flex-col items-center">
              <button
                onClick={closeModal}
                className="fixed top-4 right-4 text-black text-3xl z-50 cursor-pointer"
              >
                <RiCloseFill />
              </button>

              <div className="w-full max-w-screen-lg flex flex-col items-center gap-6 px-4">
                {imgUrls.map((url, index) => (
                  <motion.img
                    key={index}
                    src={url}
                    alt={`Image ${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="w-full h-auto max-h-[80vh] object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
