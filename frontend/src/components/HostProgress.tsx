"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  totalSteps: number;
  currentStep: number;
  segments?: number; // number of visual segments to show
};

export default function HostProgress({ totalSteps, currentStep, segments = 4 }: Props) {
  const percent = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

  // debug: attach a short instance id for runtime inspection (dev-only, lightweight)
  const instanceIdRef = useRef<string | null>(null);
  if (!instanceIdRef.current) instanceIdRef.current = Math.random().toString(36).slice(2, 8);

  useEffect(() => {
    try {
      console.log(`[HostProgress] mounted (${instanceIdRef.current})`, { totalSteps, currentStep });
    } catch {}
    return () => {
      try {
        console.log(`[HostProgress] unmounted (${instanceIdRef.current})`);
      } catch {}
    };
  }, [totalSteps, currentStep]);

  // pixel-independent separators positions
  const separators = Array.from({ length: segments - 1 }, (_, i) => ((i + 1) / segments) * 100);

  return (
    <div className="w-full" data-host-progress={String(instanceIdRef.current)}>
      <div className="relative w-full h-[6px] bg-gray-200 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-md bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />

        {/* separators */}
        {separators.map((p, idx) => (
          <div
            key={idx}
            style={{ left: `${p}%` }}
            className="absolute top-0 h-[60%] w-[2px] bg-white opacity-60 transform -translate-x-1"
          />
        ))}
      </div>
    </div>
  );
}
