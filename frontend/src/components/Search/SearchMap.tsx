"use client";

import { useEffect, useRef } from "react";
import L, { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  price: number;
  title?: string | null;
  url?: string | null;
  image?: string | null;
};

interface Props {
  points: MapPoint[];
}

export default function SearchMap({ points }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [21.0278, 105.8342],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Resize on container size change
    setTimeout(() => map.invalidateSize(), 0);
  }, []);

  // Update markers and fit bounds
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: L.LatLngBounds | null = points.length
      ? L.latLngBounds(points.map((p) => [p.lat, p.lng]))
      : null;

    const createPopupEl = (p: MapPoint) => {
      const el = document.createElement("div");
      el.className = "map-card";
      const priceLabel = `đ${Math.round(p.price).toLocaleString("vi-VN")}`;
      el.innerHTML = `
        <div class="map-card-inner">
          <div class="map-card-image">
            ${p.image ? `<img src="${p.image}" alt="${p.title ?? ""}" />` : ""}
          </div>
          <div class="map-card-body">
            <div class="map-card-title">${p.title ?? "Listing"}</div>
            <div class="map-card-price">${priceLabel} / night</div>
          </div>
        </div>
      `;
      if (p.url) {
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          try {
            if (p.url) window.location.assign(p.url);
          } catch {}
        });
      }
      return el;
    };

    for (const p of points) {
      if (!isFinite(p.lat) || !isFinite(p.lng)) continue;
      const priceLabel = `đ${Math.round(p.price).toLocaleString("vi-VN")}`;
      const icon = L.divIcon({
        className: "price-bubble",
        html: `<div>${priceLabel}</div>`,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });
      const m = L.marker([p.lat, p.lng], { icon });
      if (p.title) m.bindTooltip(p.title, { direction: "top" });
      m.on("click", () => {
        const el = createPopupEl(p);
        m.bindPopup(el, {
          className: "price-popup",
          closeButton: false,
          autoClose: true,
          maxWidth: 360,
          minWidth: 240,
          autoPan: true,
        }).openPopup();
      });
      m.addTo(layer);
    }

    if (bounds) {
      // fit all rooms initially, but don’t jump wildly for tiny sets
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    }
  }, [points]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden shadow" />
      <style jsx global>{`
        .price-bubble {
          background: transparent;
        }
        .price-bubble > div {
          background: #ffffff;
          color: #111827;
          font-weight: 600;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb; /* gray-200 */
        }
        .price-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          border: none;
        }
        .map-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 15px rgba(0,0,0,0.15);
          overflow: hidden;
          border: 1px solid #e5e7eb; /* gray-200 */
        }
        .map-card-inner { display: flex; flex-direction: column; width: 280px; }
        .map-card-image { width: 100%; height: 160px; overflow: hidden; background:#f3f4f6; }
        .map-card-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .map-card-body { padding: 10px 12px; }
        .map-card-title { font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 4px; }
        .map-card-price { font-weight: 700; color: #2563eb; font-size: 14px; }
        .leaflet-control-attribution {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
