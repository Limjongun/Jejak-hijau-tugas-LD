"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Leaf,
  Printer,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Bike,
  Sparkles,
  AlertCircle,
  FileText,
  Building,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShippingMapTracker } from "@/components/shipping-map-tracker";
import { formatRupiah } from "@/lib/utils";

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderIdOrNumber = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConfirmationSuccess, setShowConfirmationSuccess] = useState(false);

  async function fetchOrder() {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderIdOrNumber}`);
      if (!res.ok) {
        throw new Error("Pesanan tidak ditemukan.");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orderIdOrNumber) {
      fetchOrder();
    }
  }, [orderIdOrNumber]);

  // Handle Customer Confirm Delivery
  async function handleConfirmDelivery() {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          note: "Paket telah diterima dengan baik oleh pelanggan.",
          changedBy: "CUSTOMER",
        }),
      });

      if (res.ok) {
        setShowConfirmationSuccess(true);
        await fetchOrder();
      } else {
        alert("Gagal mengonfirmasi penerimaan pesanan.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent mx-auto" />
            <p className="text-xs text-[var(--muted-foreground)]">Memuat detail & tracking pesanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Pesanan Tidak Ditemukan</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Nomor pesanan "{orderIdOrNumber}" tidak terdaftar dalam database lokal kami.
            </p>
            <Link
              href="/account"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-xs font-semibold text-[var(--primary-foreground)]"
            >
              Kembali ke Riwayat Pesanan
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Stepper milestones
  const steps = [
    { key: "PAID", label: "Pembayaran Diterima", desc: "Pesanan masuk ke sistem" },
    { key: "PROCESSING", label: "Sedang Dikemas", desc: "Bebas plastik di Hub Hijau" },
    { key: "SHIPPED", label: "Dalam Pengiriman", desc: "Kurir motor listrik meluncur" },
    { key: "COMPLETED", label: "Pesanan Selesai", desc: "Diterima & poin dicairkan" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return 0;
      case "PAID":
        return 1;
      case "PROCESSING":
        return 2;
      case "SHIPPED":
      case "DELIVERED":
        return 3;
      case "COMPLETED":
        return 4;
      default:
        return 1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)] print:hidden">
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--foreground)] font-mono">
                    {order.orderNumber}
                  </span>
                  <span className="rounded-sm bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Waktu Pemesanan:{" "}
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-xs"
              >
                <Printer className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span>Cetak Invoice</span>
              </button>
            </div>
          </div>

          {/* Printable Invoice Header (Visible only when printed) */}
          <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">JEJAKHIJAU</h1>
                <p className="text-xs text-gray-700">Platform Belanja Berkelanjutan & Reduksi Emisi</p>
                <p className="text-xs text-gray-700">Jl. Dipati Ukur No. 35, Coblong, Bandung, Jawa Barat</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-black">INVOICE RESMI</h2>
                <p className="text-xs font-mono font-bold">{order.orderNumber}</p>
                <p className="text-xs text-gray-700">Status: {order.status}</p>
              </div>
            </div>
          </div>

          {/* Customer Confirmation Banner (If SHIPPED or DELIVERED) */}
          {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
            <div className="rounded-lg border-2 border-[var(--primary)] bg-[var(--primary)]/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden animate-fade-in shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[var(--primary)]" />
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Paket Telah Dikirim & Dalam Perjalanan
                  </h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Nomor Resi: <strong className="font-mono text-[var(--foreground)]">{order.trackingNumber || "JNE-ECO-889922"}</strong>. Jika barang sudah Anda terima dengan baik, silakan konfirmasi untuk mencairkan Eco Points.
                </p>
              </div>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmDelivery}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-sm transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isUpdatingStatus ? "Menyimpan..." : "Konfirmasi Pesanan Diterima"}</span>
              </button>
            </div>
          )}

          {showConfirmationSuccess && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4 text-xs text-green-700 dark:text-green-300 flex items-center gap-2 print:hidden">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Pesanan telah selesai! Sebanyak <strong>+{order.pointsEarned || 89} Eco Points</strong> telah ditambahkan ke profil Anda.
              </span>
            </div>
          )}

          {/* Stepper Status Timeline */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 print:border-gray-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-5">
              Status Perjalanan Pesanan
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {steps.map((st, i) => {
                const isPassed = currentStepIdx >= i + 1;
                const isCurrent = currentStepIdx === i + 1;
                return (
                  <div key={st.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                          isPassed
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)]"
                        }`}
                      >
                        {isPassed ? <Check className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          isCurrent
                            ? "text-[var(--primary)]"
                            : isPassed
                            ? "text-[var(--foreground)]"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {st.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] pl-9">
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live OpenStreetMap Shipping Simulator Component */}
          <div className="print:hidden">
            <ShippingMapTracker
              destLat={order.destLatitude || -6.9147}
              destLng={order.destLongitude || 107.6098}
              destAddress={order.shippingAddress || "Alamat Penerima, Bandung"}
              orderStatus={order.status}
              courierName={order.courier || "Kurir Motor Listrik EV (Green Delivery)"}
              isGreenDelivery={order.isGreenDelivery}
              distanceKm={order.deliveryDistanceKm || 4.2}
            />
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Items List */}
            <div className="md:col-span-7 space-y-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 print:border-gray-300">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Daftar Produk ({order.items?.length || 0} Item)
                </h3>

                <div className="divide-y divide-[var(--border)]">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-12 w-12 rounded-md object-cover border border-[var(--border)] print:border-gray-300"
                          />
                        )}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                            {item.productName}
                          </h4>
                          <span className="text-[11px] text-[var(--muted-foreground)]">
                            {item.quantity} x {formatRupiah(item.price)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-bold text-[var(--foreground)] tabular-nums">
                          {formatRupiah(item.price * item.quantity)}
                        </div>
                        <div className="text-[10px] text-[var(--primary)] font-medium">
                          -{item.co2SavedKg * item.quantity} kg CO₂
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Green Delivery Certificate Box */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 p-5 space-y-3 print:border-gray-300">
                <div className="flex items-center gap-2 text-[var(--primary)]">
                  <Leaf className="h-5 w-5" />
                  <h4 className="text-sm font-bold">Sertifikat Dampak Lingkungan Pesanan</h4>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Dengan memilih produk ramah lingkungan dan pengiriman armada niremisi pada pesanan ini, Anda telah berhasil mencegah timbulan emisi dan sampah plastik ke lingkungan.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-center">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                      Reduksi Emisi CO₂
                    </span>
                    <div className="text-lg font-bold text-[var(--primary)] tabular-nums mt-0.5">
                      -{order.totalCo2Kg} kg
                    </div>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-center">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
                      Sampah Plastik Terhindar
                    </span>
                    <div className="text-lg font-bold text-[var(--foreground)] tabular-nums mt-0.5">
                      -{order.totalPlastic} unit
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary & Address Card */}
            <div className="md:col-span-5 space-y-4">
              {/* Shipping & Recipient Card */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-3 print:border-gray-300">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--primary)]" />
                  Alamat Pengiriman
                </h3>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[var(--foreground)]">
                    {order.customerName || "Pelanggan JejakHijau"}
                  </div>
                  <div className="text-[var(--muted-foreground)]">{order.customerPhone || "-"}</div>
                  <div className="text-[var(--foreground)] pt-1 leading-relaxed">
                    {order.shippingAddress}
                  </div>
                  {order.destLatitude && (
                    <div className="text-[10px] text-[var(--muted-foreground)] tabular-nums pt-1">
                      Koordinat GIS: {order.destLatitude.toFixed(4)}, {order.destLongitude?.toFixed(4)}
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border)] pt-3 text-xs space-y-1">
                  <div className="text-[var(--muted-foreground)]">Metode Pengiriman:</div>
                  <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                    <Bike className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span>{order.courier}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-[11px] text-[var(--muted-foreground)]">
                      No. Resi: <span className="font-mono text-[var(--foreground)]">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Breakdown Card */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-3 print:border-gray-300">
                <h3 className="text-sm font-bold text-[var(--foreground)]">Rincian Pembayaran</h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Subtotal Produk</span>
                    <span className="tabular-nums font-medium text-[var(--foreground)]">
                      {formatRupiah(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Ongkos Kirim</span>
                    <span className="tabular-nums font-medium text-[var(--foreground)]">
                      {formatRupiah(order.shippingCost)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-[var(--primary)]">
                      <span>Potongan Diskon Poin</span>
                      <span className="tabular-nums font-medium">
                        -{formatRupiah(order.discount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[var(--border)] pt-2.5 flex justify-between text-sm font-bold text-[var(--foreground)]">
                    <span>Total Pembayaran</span>
                    <span className="tabular-nums text-[var(--primary)]">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-3 text-[11px] text-[var(--muted-foreground)] space-y-1">
                  <div className="flex justify-between">
                    <span>Metode:</span>
                    <span className="font-medium text-[var(--foreground)]">{order.paymentMethod || "QRIS Standar"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Perolehan Poin:</span>
                    <span className="font-bold text-[var(--primary)]">+{order.pointsEarned || 89} Eco Points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function OrderDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">
            Memuat detail & tracking pesanan...
          </div>
        </div>
      }
    >
      <OrderDetailContent />
    </React.Suspense>
  );
}
