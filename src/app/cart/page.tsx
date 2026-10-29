"use client";

import React from "react";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { CarbonCalculatorCard } from "@/components/carbon-calculator-card";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalWeight,
    getImpact,
    getEstimatedPoints,
    getTotalItems,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const totalWeight = getTotalWeight();
  const impact = getImpact();
  const points = getEstimatedPoints();
  const totalItems = getTotalItems();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Evaluasi Belanja
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-0.5">
              Keranjang & Dampak Lingkungan
            </h1>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] tabular-nums">
              Periksa daftar barang dan ringkasan reduksi emisi karbon yang dihasilkan.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)] mb-3">
                <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                Keranjang belanja Anda masih kosong
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm leading-relaxed">
                Mulai tambahkan produk ramah lingkungan dari katalog kami untuk memulai penghematan jejak karbon pertama Anda.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
              >
                Buka Katalog Produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                    Daftar Produk ({totalItems} item)
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>

                <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-20 w-20 shrink-0 rounded-md object-cover bg-[var(--secondary)] border border-[var(--border)]"
                      />

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.productId)}
                              aria-label={`Hapus ${item.product.name}`}
                              className="text-[var(--muted-foreground)] hover:text-[var(--accent)] p-1 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted-foreground)] tabular-nums">
                            <span>{item.product.weightGram} gram/unit</span>
                            <span>•</span>
                            <span className="text-[var(--primary)] font-semibold">
                              {item.product.co2SavedKg > 0 &&
                                `-${(
                                  item.product.co2SavedKg * item.quantity
                                ).toFixed(1)} kg CO₂`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          {/* Quantity selector */}
                          <div className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] p-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              aria-label="Kurangi kuantitas"
                              className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[var(--foreground)] tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product.stock}
                              aria-label="Tambah kuantitas"
                              className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>

                          <div className="text-sm font-bold text-[var(--foreground)] tabular-nums">
                            {formatRupiah(item.product.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Eco packaging assurance */}
                <div className="flex items-start gap-2.5 rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 p-3 text-xs text-[var(--foreground)]">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--primary)] mt-0.5" strokeWidth={1.75} />
                  <span>
                    Semua pesanan otomatis dikemas menggunakan bahan karton daur ulang tanpa bubble wrap plastik.
                  </span>
                </div>
              </div>

              {/* Right Column: Carbon Calculator & Order Summary */}
              <div className="lg:col-span-5 space-y-4">
                <CarbonCalculatorCard
                  impact={impact}
                  points={points}
                  variant="full"
                />

                {/* Order Summary Box */}
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-2.5">
                    Ringkasan Transaksi
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Total Harga ({totalItems} barang)</span>
                      <span className="font-semibold text-[var(--foreground)] tabular-nums">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[var(--muted-foreground)]">
                      <span>Estimasi Berat Total</span>
                      <span className="font-semibold text-[var(--foreground)] tabular-nums">
                        {totalWeight >= 1000
                          ? `${(totalWeight / 1000).toFixed(1)} kg`
                          : `${totalWeight} gram`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[var(--primary)] font-semibold">
                      <span>Perolehan Eco Points</span>
                      <span className="tabular-nums">+{points} Poin</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      Subtotal
                    </span>
                    <span className="text-xl font-bold text-[var(--foreground)] tabular-nums">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex w-full h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    <span>Lanjut ke Checkout</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>

                  <p className="text-center text-[11px] text-[var(--muted-foreground)]">
                    Ongkos kirim & voucher diskon akan dihitung pada tahap checkout.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
