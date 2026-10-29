"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Navigation, X, Check, Loader2, Sparkles, Bike } from "lucide-react";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelectLocation: (data: {
    lat: number;
    lng: number;
    addressText: string;
    distanceKm: number;
    co2SavedKg: number;
  }) => void;
}

// Hub Central JejakHijau (Coblong, Bandung)
const HUB_LAT = -6.8905;
const HUB_LNG = 107.6162;

// Calculate distance in KM using Haversine Formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function LocationPickerModal({
  isOpen,
  onClose,
  initialLat = -6.9147,
  initialLng = 107.6098,
  initialAddress = "",
  onSelectLocation,
}: LocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState<string>(initialAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [distanceKm, setDistanceKm] = useState(4.2);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Calculate distance & CO2 reduction (approx 0.08 kg CO2 per km saved by EV fleet vs conventional)
  useEffect(() => {
    const dist = calculateDistance(HUB_LAT, HUB_LNG, coords.lat, coords.lng);
    setDistanceKm(dist < 0.5 ? 1 : dist);
  }, [coords]);

  const co2SavedDelivery = Number((distanceKm * 0.08).toFixed(2));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapContainerRef.current || !isMounted) return;

      // Clean existing instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize Map
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
        maxZoom: 19,
      }).addTo(map);

      // Hub Marker (Pusat Logistik)
      const hubIcon = L.divIcon({
        className: "custom-hub-icon",
        html: `
          <div style="background:#1F3D2B;color:#F4F1E8;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">
            🌱
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([HUB_LAT, HUB_LNG], { icon: hubIcon })
        .addTo(map)
        .bindPopup("<b>Hub Logistik JejakHijau</b><br>Jl. Dipati Ukur, Bandung");

      // Customer Location Pin
      const pinIcon = L.divIcon({
        className: "custom-pin-icon",
        html: `
          <div style="background:#C2562E;color:#fff;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.4);">
            <div style="transform:rotate(45deg);font-size:12px;font-weight:bold;">📍</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode if no address yet
      if (!address) {
        reverseGeocode(coords.lat, coords.lng);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // OpenStreetMap Nominatim Reverse Geocoding (Free & Open Source)
  async function reverseGeocode(lat: number, lng: number) {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "id,en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn("Nominatim reverse geocode fallback:", err);
    } finally {
      setIsGeocoding(false);
    }
  }

  // OpenStreetMap Nominatim Forward Geocoding Search
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=4`,
        { headers: { "Accept-Language": "id,en" } }
      );
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
        if (results.length > 0) {
          selectSearchResult(results[0]);
        }
      }
    } catch (err) {
      console.error("Nominatim search error:", err);
    } finally {
      setIsSearching(false);
    }
  }

  function selectSearchResult(item: any) {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ lat, lng });
    setAddress(item.display_name);
    setSearchResults([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
  }

  // Browser HTML5 Geolocation (GPS)
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        alert("Gagal membaca lokasi GPS. Mohon izinkan akses lokasi pada browser.");
        setIsGeocoding(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleConfirm() {
    onSelectLocation({
      lat: coords.lat,
      lng: coords.lng,
      addressText: address || `Titik Koordinat: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      distanceKm,
      co2SavedKg: co2SavedDelivery,
    });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--secondary)]/30">
          <div className="flex items-center gap-2.5">
            <div className="rounded-md bg-[var(--primary)]/10 p-2 text-[var(--primary)] border border-[var(--primary)]/20">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Pilih Titik Alamat Pengiriman (OpenStreetMap)
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Bebas API berbayar: Open-source geocoding & estimasi rute kurir niremisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-[var(--border)] space-y-3 bg-[var(--card)]">
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                placeholder="Cari jalan, kelurahan, atau nama gedung di Indonesia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-24 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-hidden"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 rounded-sm bg-[var(--secondary)] px-3 py-1 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              >
                {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Cari Lokasi"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shrink-0"
            >
              <Navigation className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Gunakan GPS Saya</span>
            </button>
          </div>

          {/* Search suggestions dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-1.5 space-y-1 shadow-md max-h-36 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-2.5 py-1.5 rounded-xs text-xs text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-[var(--primary)] mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[300px] w-full bg-[var(--secondary)]/20">
          <div ref={mapContainerRef} className="h-full w-full min-h-[300px] z-10" />

          {/* Floating Instruction overlay */}
          <div className="absolute top-3 left-3 z-20 rounded-md bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--foreground)] shadow-xs pointer-events-none">
            💡 Geser peta atau klik pada titik yang Anda tuju
          </div>

          {isGeocoding && (
            <div className="absolute top-3 right-3 z-20 rounded-md bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border)] px-3 py-1.5 text-[11px] font-medium text-[var(--foreground)] shadow-xs flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
              <span>Mencari alamat...</span>
            </div>
          )}
        </div>

        {/* Location Info & Delivery Impact Banner */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/30 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                  Alamat Terpilih
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] tabular-nums">
                  ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
                </span>
              </div>
              <p className="text-xs text-[var(--foreground)] font-medium line-clamp-2">
                {address || "Memuat deskripsi alamat..."}
              </p>
            </div>

            {/* Distance & Eco Stats */}
            <div className="flex items-center gap-3 shrink-0 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-2 sm:pt-0 sm:pl-3">
              <div className="text-right">
                <div className="text-[10px] text-[var(--muted-foreground)]">Jarak dari Hub</div>
                <div className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                  ~{distanceKm} km
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[var(--muted-foreground)]">Reduksi Emisi EV</div>
                <div className="text-xs font-bold text-[var(--primary)] tabular-nums">
                  -{co2SavedDelivery} kg CO₂
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--border)] bg-transparent px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-5 py-2 text-xs font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-xs transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Gunakan Titik Alamat Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
