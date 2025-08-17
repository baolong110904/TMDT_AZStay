"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  address?: string;
  hideHeader?: boolean;
}

export default function MapDisplay({ latitude, longitude, address, hideHeader }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Define a red icon for the marker
    const redIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (mapInstance.current) {
      mapInstance.current.setView([latitude, longitude], 15);
      // Remove all existing markers
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstance.current?.removeLayer(layer);
        }
      });
      // Close any open popups
      mapInstance.current.closePopup();
      const marker = L.marker([latitude, longitude], { icon: redIcon })
        .addTo(mapInstance.current)
        .bindPopup(`Latitude: ${latitude}<br/>Longitude: ${longitude}`);
      marker.openPopup();
    } else {
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);
      // Close any open popups
      mapInstance.current.closePopup();
      const marker = L.marker([latitude, longitude], { icon: redIcon })
        .addTo(mapInstance.current)
        .bindPopup(`Latitude: ${latitude}<br/>Longitude: ${longitude}`);
      marker.openPopup();
    }

    // Cleanup
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, address]);

  return (
    <div>
      {!hideHeader && (
        <>
          <h2 className="text-2xl font-bold mb-2">Where you’ll be</h2>
          <p className="mb-4">{address}</p>
        </>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "16px", position: "relative", zIndex: 0 }} />
    </div>
  );
}