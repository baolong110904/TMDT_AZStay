"use client";

import { useEffect } from "react";

export type SortKey = "price-asc" | "price-desc" | "rating-desc" | "rating-asc";

interface Props {
  domainMin: number;
  domainMax: number;
  priceRange: [number, number];
  step: number;
  sortKey: SortKey;
  onPriceMinChange: (v: number) => void;
  onPriceMaxChange: (v: number) => void;
  onSortChange: (key: SortKey) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function FilterPanel({
  domainMin,
  domainMax,
  priceRange,
  step,
  sortKey,
  onPriceMinChange,
  onPriceMaxChange,
  onSortChange,
  onReset,
  onClose,
}: Props) {
  // Clamp slider visuals to domain so the track never overflows even if user inputs are out-of-domain
  const sliderMin = Math.min(Math.max(priceRange[0], domainMin), domainMax);
  const sliderMax = Math.min(Math.max(priceRange[1], domainMin), domainMax);
  const pct = (v: number) => (domainMax === domainMin ? 0 : ((v - domainMin) / (domainMax - domainMin)) * 100);
  const minPercent = Math.min(100, Math.max(0, pct(sliderMin)));
  const maxPercent = Math.min(100, Math.max(0, pct(sliderMax)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="rounded-2xl p-1">
          <div className="rounded-2xl bg-white p-4">
            <div className="relative flex items-center justify-center">
              <h3 className="text-xl font-semibold text-gray-900 text-center">Filters</h3>
              <button
                onClick={onClose}
                className="absolute right-0 text-sm text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Sort by (moved before Price range) */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Sort by</h4>
                  <p className="text-xs text-gray-500">Order listings the way you like</p>
                </div>
              </div>

        <div className="mt-3">
                <select
          className="border border-gray-300 px-3 py-2 rounded-xl shadow-sm"
                  value={sortKey}
                  onChange={(e) => onSortChange(e.target.value as SortKey)}
                >
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="rating-desc">Rating: High → Low</option>
                  <option value="rating-asc">Rating: Low → High</option>
                </select>
              </div>
            </div>

            {/* Price range */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Price range</h4>
                  <p className="text-xs text-gray-500">Trip price, includes all fees</p>
                </div>
                <button onClick={onReset} className="text-sm text-blue-600 hover:underline">Reset</button>
              </div>

              {/* Slider track */}
              <div className="mt-4">
                <div className="relative h-2 rounded-full bg-gray-200">
                  <div
                    className="absolute h-2 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"
                    style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}
                  />
                  <input
                    type="range"
                    min={domainMin}
                    max={domainMax}
                    step={step}
                    value={sliderMin}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const otherMax = Math.min(priceRange[1], domainMax);
                      const clamped = Math.min(Math.max(raw, domainMin), otherMax - step);
                      onPriceMinChange(clamped);
                    }}
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 transform w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:background-transparent"
                    style={{ zIndex: 20 }}
                  />
                  <input
                    type="range"
                    min={domainMin}
                    max={domainMax}
                    step={step}
                    value={sliderMax}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const otherMin = Math.max(priceRange[0], domainMin);
                      const clamped = Math.max(Math.min(raw, domainMax), otherMin + step);
                      onPriceMaxChange(clamped);
                    }}
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 transform w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:background-transparent"
                    style={{ zIndex: 30 }}
                  />
                </div>
              </div>

              {/* Inputs and sort */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Minimum</span>
                  <div className="flex items-center rounded-xl border border-gray-300 px-3 py-2 shadow-sm">
                    <span className="mr-1 text-gray-500">đ</span>
                    <input
                      type="number"
                      className="w-28 outline-none"
                      value={priceRange[0]}
                      step={step}
                      onChange={(e) => onPriceMinChange(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Maximum</span>
                  <div className="flex items-center rounded-xl border border-gray-300 px-3 py-2 shadow-sm">
                    <span className="mr-1 text-gray-500">đ</span>
                    <input
                      type="number"
                      className="w-28 outline-none"
                      value={priceRange[1]}
                      step={step}
                      onChange={(e) => onPriceMaxChange(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:opacity-95"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
