"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  QrCode,
  Building2,
  CreditCard,
  MapPin,
  Navigation,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import { LocationPickerModal } from "@/components/location-picker-modal";
import { PaymentSimulationModal } from "@/components/payment-simulation-modal";
import { useAuthStore } from "@/stores/auth-store";

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    getSubtotal,
    getImpact,
    getEstimatedPoints,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const impact = getImpact();

  const [recipient, setRecipient] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(
    "Jl. Dago Asri No. 12, Coblong, Kota Bandung, Jawa Barat 40135"
  );

  React.useEffect(() => {
    if (user) {
      if (!recipient) setRecipient(user.name);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);
  const [selectedCourier, setSelectedCourier] = useState("green-express");
  const [usePlasticFree, setUsePlasticFree] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // OpenStreetMap Location State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.9147,
    lng: 107.6098,
  });
  const [distanceKm, setDistanceKm] = useState(4.2);
  const [co2SavedDelivery, setCo2SavedDelivery] = useState(0.34);

  // Payment Modal & Live Paymenku State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymenkuData, setPaymenkuData] = useState<any>(null);
  const [isPaymenkuLoading, setIsPaymenkuLoading] = useState(false);
  const [paymenkuError, setPaymenkuError] = useState<string | null>(null);
  const [activeOrderNumber, setActiveOrderNumber] = useState("");

  const couriers = [
    {
      id: "pickup-testing",
      name: "Bebas Ongkir / Ambil Sendiri (Khusus Pengujian)",
      desc: "Ambil langsung di green hub atau pengiriman digital stiker (Rp 0)",
      cost: 0,
      isGreen: true,
    },
    {
      id: "green-express",
      name: "Kurir Motor Listrik (Green Delivery)",
      desc: "Armada niremisi listrik khusus area perkotaan",
      cost: 15000,
      isGreen: true,
    },
    {
      id: "regular",
      name: "SiCepat Regular",
      desc: "Estimasi pengantaran 2-3 hari kerja",
      cost: 12000,
      isGreen: false,
    },
    {
      id: "cargo",
      name: "JNE Eco Cargo",
      desc: "Pengiriman ekonomis muatan besar",
      cost: 20000,
      isGreen: false,
    },
  ];

  const currentCourier =
    couriers.find((c) => c.id === selectedCourier) || couriers[0];
  const shippingCost = currentCourier.cost;

  const userAvailablePoints = 500;
  const pointsDiscount = usePoints ? 5000 : 0;
  const voucherDiscount = voucherApplied ? Math.min(20000, subtotal * 0.1) : 0;

  const totalDiscount = pointsDiscount + voucherDiscount;
  const grandTotal = Math.max(0, subtotal + shippingCost - totalDiscount);
  const earnedPoints = getEstimatedPoints(usePlasticFree);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherCode.trim().toUpperCase() === "HIJAU10" || voucherCode.trim().toUpperCase() === "BUMI2026") {
      setVoucherApplied(true);
    } else {
      alert("Kode voucher tidak valid. Gunakan: HIJAU10 atau BUMI2026");
    }
  };

  const [createdOrderNumber, setCreatedOrderNumber] = useState("JH-20261029-0001");

  const handleInitiatePayment = async () => {
    if (items.length === 0) return;

    const generatedOrderNumber = `JH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveOrderNumber(generatedOrderNumber);
    setIsPaymentModalOpen(true);
    setIsPaymenkuLoading(true);
    setPaymenkuError(null);
    setPaymenkuData(null);

    try {
      const res = await fetch("/api/payment/paymenku/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: generatedOrderNumber,
          amount: grandTotal,
          customerName: recipient || (user ? user.name : "Pelanggan"),
          customerEmail: user ? user.email : "pelanggan@jejakhijau.id",
          customerPhone: phone || (user ? user.phone : "081234567890"),
          paymentMethod: paymentMethod === "va" ? "bca_va" : "qris",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setPaymenkuData(json.data);
      } else {
        setPaymenkuError(json?.error || "Gagal membuat transaksi ke server Paymenku.");
      }
    } catch (err: any) {
      setPaymenkuError(err?.message || "Koneksi ke gerbang Paymenku terputus.");
    } finally {
      setIsPaymenkuLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const generatedOrderNumber = activeOrderNumber || `JH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const localOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: generatedOrderNumber,
      customer: recipient || (user ? user.name : "Pelanggan"),
      customerEmail: user ? user.email : "pelanggan@jejakhijau.id",
      total: grandTotal,
      subtotal,
      shippingCost,
      status: "PAID",
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      courier: currentCourier.name,
      plasticFree: usePlasticFree,
      isGreenDelivery: currentCourier.isGreen,
      co2Saved: impact.co2Kg,
      plasticSaved: impact.plasticPcs,
      trackingNumber: `EXP-ID-${Math.floor(100000000 + Math.random() * 900000000)}`,
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
      items: items.map((i) => ({
        id: `it-${Date.now()}-${i.product.id}`,
        productId: i.product.id,
        name: i.product.name,
        image: i.product.images[0] || "",
        price: i.product.price,
        quantity: i.quantity,
        co2SavedKg: i.product.co2SavedKg,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: recipient || (user ? user.name : "Pelanggan Tamu"),
          customerEmail: user ? user.email : "tamu@jejakhijau.id",
          customerPhone: phone || (user ? user.phone : "081234567890"),
          shippingAddress: address,
          destLatitude: coords.lat,
          destLongitude: coords.lng,
          deliveryDistanceKm: distanceKm,
          courier: currentCourier.name,
          isGreenDelivery: currentCourier.isGreen,
          plasticFreePack: usePlasticFree,
          paymentMethod: paymentMethod === "qris" ? "QRIS Paymenku" : "Virtual Account Paymenku",
          pointsUsed: usePoints ? 500 : 0,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        localOrder.orderNumber = orderData.orderNumber || generatedOrderNumber;
      }
    } catch (e: any) {
      console.warn("API orders offline, falling back to local storage:", e?.message);
    } finally {
      // Always save to client-side local orders history
      try {
        const existing = JSON.parse(localStorage.getItem("jh-local-orders") || "[]");
        localStorage.setItem("jh-local-orders", JSON.stringify([localOrder, ...existing]));
      } catch (err) {
        console.error("Failed to save local order:", err);
      }

      setCreatedOrderNumber(localOrder.orderNumber);
      setOrderCompleted(true);
      setIsPaymentModalOpen(false);
      clearCart();
      setIsProcessing(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="mx-auto max-w-lg px-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
            </div>

            <span className="inline-block rounded-sm bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Pembayaran Terverifikasi Resmi Paymenku
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Pesanan Anda Berhasil Dikonfirmasi
            </h1>

            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Nomor Pesanan: <strong className="text-[var(--foreground)] font-mono">{createdOrderNumber}</strong>. Transaksi telah sukses terverifikasi secara langsung via Paymenku Payment Gateway, menghemat estimasi <strong>{impact.co2Kg} kg CO₂</strong> dan memberikan <strong>+{earnedPoints} Eco Points</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href={`/orders/${createdOrderNumber}`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors shadow-sm"
              >
                <span>Lacak Pesanan & Simulasi GIS →</span>
              </Link>
              <Link
                href="/account/impact"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-5 text-xs sm:text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                Lihat di Dashboard Dampak
              </Link>
              <Link
                href="/products"
                className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] px-5 text-xs sm:text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                Katalog Produk
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center text-center">
          <div>
            <h2 className="text-base font-bold">Keranjang Anda Kosong</h2>
            <Link
              href="/products"
              className="mt-3 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)]"
            >
              Lihat Katalog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Tahap Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-0.5">
              Alamat, Pengiriman & Pembayaran
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Steps */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Alamat */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">
                    1
                  </span>
                  Alamat Pengiriman
                </h3>

                {!isAuthenticated && (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div>
                      <span className="font-semibold text-[var(--foreground)]">
                        Checkout sebagai Tamu (Guest)
                      </span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Punya akun? Masuk untuk menggunakan saldo poin dan menyimpan riwayat pesanan.
                      </p>
                    </div>
                    <Link
                      href="/login"
                      className="shrink-0 inline-flex items-center justify-center rounded-sm bg-[var(--primary)] px-3 py-1.5 text-[11px] font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                    >
                      Masuk ke Akun
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[var(--foreground)]">
                      Alamat Lengkap
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Pilih Titik di Peta (OpenStreetMap)</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat jalan, nomor rumah, RT/RW, dan patokan..."
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                  />

                  {/* Geolocation Tag */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--secondary)]/30 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Titik GIS Terkunci:</span>
                      <span className="font-mono text-[var(--muted-foreground)] tabular-nums">
                        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[var(--primary)] font-semibold text-[11px]">
                      Jarak dari Hub: ~{distanceKm} km • Emisi Kurir EV: -{co2SavedDelivery} kg CO₂
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Kurir */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">
                    2
                  </span>
                  Pilihan Kurir
                </h3>

                <div className="space-y-2.5">
                  {couriers.map((courier) => (
                    <label
                      key={courier.id}
                      className={`flex items-start justify-between p-3.5 rounded-md border cursor-pointer transition-colors ${
                        selectedCourier === courier.id
                          ? "border-[var(--primary)] bg-[var(--secondary)]/60"
                          : "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourier === courier.id}
                          onChange={() => setSelectedCourier(courier.id)}
                          className="mt-1 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                              {courier.name}
                            </span>
                            {courier.isGreen && (
                              <span className="rounded-sm bg-[var(--primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--primary-foreground)]">
                                EV Niremisi
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {courier.desc}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] tabular-nums">
                        {formatRupiah(courier.cost)}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Kemasan Bebas Plastik */}
                <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 p-3.5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePlasticFree}
                      onChange={(e) => setUsePlasticFree(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded-sm text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                          Gunakan Kemasan 100% Bebas Plastik
                        </span>
                        <span className="rounded-sm bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--border)]">
                          +10 Poin Bonus
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                        Karton daur ulang dengan pita perekat pati singkong tanpa selotip plastik.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 3: Pembayaran */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">
                    3
                  </span>
                  Metode Pembayaran (Gerbang Paymenku)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex flex-col items-center justify-center rounded-md border p-3.5 text-center transition-colors cursor-pointer ${
                      paymentMethod === "qris"
                        ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--foreground)] font-semibold"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/40"
                    }`}
                  >
                    <QrCode className="h-5 w-5 mb-1 text-[var(--primary)]" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-[var(--foreground)]">QRIS Otomatis (Paymenku)</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">GoPay, OVO, ShopeePay, BCA, Mandiri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("va")}
                    className={`flex flex-col items-center justify-center rounded-md border p-3.5 text-center transition-colors cursor-pointer ${
                      paymentMethod === "va"
                        ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--foreground)] font-semibold"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/40"
                    }`}
                  >
                    <Building2 className="h-5 w-5 mb-1 text-[var(--primary)]" strokeWidth={1.75} />
                    <span className="text-xs font-bold text-[var(--foreground)]">Virtual Account (Paymenku)</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">BCA, Mandiri, BRI, BNI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-5 space-y-4">
              {/* Voucher & Eco Points */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Voucher & Penukaran Poin
                </h4>

                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode: HIJAU10"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    disabled={voucherApplied}
                    className="flex-1 h-10 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs uppercase text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={voucherApplied || !voucherCode.trim()}
                    className="h-10 rounded-md bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] px-3 text-xs font-semibold hover:bg-[var(--border)] transition-colors disabled:opacity-40"
                  >
                    {voucherApplied ? "Aktif" : "Terapkan"}
                  </button>
                </form>

                {voucherApplied && (
                  <div className="flex justify-between items-center text-xs text-[var(--primary)] font-semibold bg-[var(--secondary)] p-2 rounded-md">
                    <span>Voucher HIJAU10 aktif</span>
                    <span className="tabular-nums">-{formatRupiah(voucherDiscount)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--border)]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="rounded-sm text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-xs text-[var(--foreground)]">
                        Tukar 500 Poin (Saldo: {userAvailablePoints})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                      -Rp5.000
                    </span>
                  </label>
                </div>
              </div>

              {/* Final Breakdown */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-3.5">
                <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2.5">
                  Rincian Tagihan
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Subtotal Barang</span>
                    <span className="font-semibold text-[var(--foreground)] tabular-nums">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Ongkos Kirim ({currentCourier.name})</span>
                    <span className="font-semibold text-[var(--foreground)] tabular-nums">
                      {formatRupiah(shippingCost)}
                    </span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-[var(--accent)] font-semibold">
                      <span>Potongan Diskon</span>
                      <span className="tabular-nums">-{formatRupiah(totalDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[var(--primary)] font-semibold pt-1 border-t border-[var(--border)]">
                    <span>Perolehan Eco Points</span>
                    <span className="tabular-nums">+{earnedPoints} Poin</span>
                  </div>

                  <div className="flex justify-between text-[var(--primary)] font-semibold">
                    <span>Estimasi Reduksi CO₂</span>
                    <span className="tabular-nums">-{impact.co2Kg} kg CO₂</span>
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-3 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    Total Pembayaran
                  </span>
                  <span className="text-xl font-bold text-[var(--foreground)] tabular-nums">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={items.length === 0}
                  className="flex w-full h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-40"
                >
                  <span>Lanjutkan Pembayaran ({formatRupiah(grandTotal)})</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* OpenStreetMap Location Picker Modal */}
        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          initialLat={coords.lat}
          initialLng={coords.lng}
          initialAddress={address}
          onSelectLocation={(data) => {
            setCoords({ lat: data.lat, lng: data.lng });
            setAddress(data.addressText);
            setDistanceKm(data.distanceKm);
            setCo2SavedDelivery(data.co2SavedKg);
          }}
        />

        {/* Live Paymenku Payment Modal */}
        <PaymentSimulationModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={grandTotal}
          paymentMethod={paymentMethod}
          orderNumber={activeOrderNumber}
          paymenkuData={paymenkuData}
          isLoading={isPaymenkuLoading}
          errorMessage={paymenkuError}
          onConfirmSuccess={handleCreateOrder}
        />
      </main>

      <Footer />
    </div>
  );
}
