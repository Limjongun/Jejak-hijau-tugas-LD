"use client";

import React, { useEffect, useRef } from "react";
import { Bike, Navigation, MapPin, Leaf, ShieldCheck, Zap } from "lucide-react";

interface ShippingMapTrackerProps {
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  orderStatus: string;
  courierName?: string;
  isGreenDelivery?: boolean;
  distanceKm?: number;
}

const HUB_LAT = -6.8905;
const HUB_LNG = 107.6162;

export function ShippingMapTracker({
  destLat = -6.9147,
  destLng = 107.6098,
  destAddress = "Jl. Dago Asri No. 12, Bandung",
  orderStatus = "SHIPPED",
  courierName = "Kurir Motor Listrik (Green Delivery)",
  isGreenDelivery = true,
  distanceKm = 4.2,
}: ShippingMapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Determine courier position progress along the route (0.0 to 1.0)
  const getProgress = () => {
    switch (orderStatus) {
      case "PENDING_PAYMENT":
      case "PAID":
        return 0.05;
      case "PROCESSING":
        return 0.2;
      case "SHIPPED":
        return 0.65;
      case "DELIVERED":
      case "COMPLETED":
        return 1.0;
      default:
        return 0.5;
    }
  };

  const progress = getProgress();
  const courierLat = HUB_LAT + (destLat - HUB_LAT) * progress;
  const courierLng = HUB_LNG + (destLng - HUB_LNG) * progress;

  const co2ReducedCourier = (distanceKm * 0.08).toFixed(2);

  useEffect(() => {
    if (!mapRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || !isMounted) return;

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Center map between Hub and Destination
      const midLat = (HUB_LAT + destLat) / 2;
      const midLng = (HUB_LNG + destLng) / 2;

      const map = L.map(mapRef.current, {
        center: [midLat, midLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Free OpenStreetMap Tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Hub Marker (Start)
      const hubIcon = L.divIcon({
        className: "hub-marker",
        html: `
          <div style="background:#1F3D2B;color:#F4F1E8;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">
            🌱
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([HUB_LAT, HUB_LNG], { icon: hubIcon })
        .addTo(map)
        .bindPopup("<b>Hub Pengiriman Hijau JejakHijau</b><br>Pusat Logistik Niremisi");

      // Destination Marker (Customer)
      const destIcon = L.divIcon({
        className: "dest-marker",
        html: `
          <div style="background:#C2562E;color:#fff;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);">
            <div style="transform:rotate(45deg);font-size:12px;">🏠</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Tujuan Penerima</b><br>${destAddress}`);

      // Route Path (Green Polyline)
      const routePoints: [number, number][] = [
        [HUB_LAT, HUB_LNG],
        // mid curve point for realistic road curvature
        [
          (HUB_LAT + destLat) / 2 + 0.003,
          (HUB_LNG + destLng) / 2 - 0.002,
        ],
        [destLat, destLng],
      ];

      L.polyline(routePoints, {
        color: "#2E5A3C",
        weight: 4,
        opacity: 0.8,
        dashArray: "6, 8",
      }).addTo(map);

      // Animated / Active Courier Vehicle Marker
      const courierIcon = L.divIcon({
        className: "courier-marker",
        html: `
          <div style="background:#2E5A3C;color:#ffffff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #F4F1E8;box-shadow:0 0 0 4px rgba(46,90,60,0.3);animation:pulse 2s infinite;">
            🛵
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      L.marker([courierLat, courierLng], { icon: courierIcon })
        .addTo(map)
        .bindPopup(
          `<b>${courierName}</b><br>Armada: Motor Listrik EV<br>Status: ${
            orderStatus === "SHIPPED" ? "Sedang Mengantar" : orderStatus
          }`
        )
        .openPopup();

      // Fit bounds to show both points nicely
      map.fitBounds([
        [HUB_LAT, HUB_LNG],
        [destLat, destLng],
      ], { padding: [50, 50] });

      mapInstance.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [destLat, destLng, orderStatus]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-[var(--border)] bg-[var(--secondary)]/30">
        <div className="flex items-center gap-2.5">
          <div className="rounded-md bg-[var(--primary)]/10 p-2 text-[var(--primary)] border border-[var(--primary)]/20">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Live Tracking Pengiriman
              </h3>
              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                OpenStreetMap GIS
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {courierName} • Armada Ramah Lingkungan
            </p>
          </div>
        </div>

        {/* Courier Distance & Eco Stats */}
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-[var(--muted-foreground)] block">
              Jarak Rute
            </span>
            <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
              ~{distanceKm} km
            </span>
          </div>
          <div className="text-left sm:text-right border-l border-[var(--border)] pl-3">
            <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
              <Leaf className="h-3 w-3 text-[var(--primary)]" />
              Reduksi Emisi
            </span>
            <span className="text-xs font-bold text-[var(--primary)] tabular-nums">
              -{co2ReducedCourier} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-64 sm:h-72 w-full bg-[var(--secondary)]/20">
        <div ref={mapRef} className="h-full w-full z-10" />

        {/* Floating Telemetry Box */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 rounded-md bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border)] p-3 text-xs shadow-md space-y-1 sm:max-w-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--foreground)] text-[11px]">
            <Zap className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Telemetri Armada Niremisi</span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            {orderStatus === "SHIPPED"
              ? "Kurir sedang meluncur di jalur perkotaan menuju alamat Anda."
              : orderStatus === "COMPLETED"
              ? "Pesanan telah tiba dan diterima dengan selamat."
              : "Paket siap diberangkatkan dari Hub Logistik Hijau."}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-[var(--secondary)]/10 text-[11px] text-[var(--muted-foreground)] flex items-center justify-between border-t border-[var(--border)]">
        <span>📍 Titik Pengantaran: <strong className="text-[var(--foreground)] line-clamp-1">{destAddress}</strong></span>
        <span className="shrink-0 text-[10px] text-[var(--muted-foreground)]">Peta OpenStreetMap</span>
      </div>
    </div>
  );
}
