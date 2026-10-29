"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import { CarbonCalculatorCard } from "./carbon-calculator-card";

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    getSubtotal,
    getImpact,
    getEstimatedPoints,
    getTotalItems,
  } = useCartStore();

  const subtotal = getSubtotal();
  const impact = getImpact();
  const estimatedPoints = getEstimatedPoints();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/40 transition-opacity"
      />

      {/* Drawer Container: Clean border, solid surface */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-[var(--card)] shadow-elevated transition-transform border-l border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Keranjang Belanja
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                {totalItems} barang dipilih
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup keranjang"
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)] mb-3">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                Keranjangmu masih kosong
              </h4>
              <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-xs leading-relaxed">
                Mulai dari produk ramah lingkungan pilihan untuk mengurangi jejak karbon sehari-hari.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="mt-5 rounded-md bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
              >
                Lihat Katalog Produk
              </button>
            </div>
          ) : (
            <>
              {/* Product items */}
              <div className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-16 w-16 shrink-0 rounded-md object-cover bg-[var(--secondary)] border border-[var(--border)]"
                    />

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-xs font-semibold text-[var(--foreground)] line-clamp-1 hover:text-[var(--primary)] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Hapus ${item.product.name}`}
                          className="text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </button>
                      </div>

                      <div className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                        {formatRupiah(item.product.price)}
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] p-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            aria-label="Kurangi kuantitas"
                            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <Minus className="h-3 w-3" strokeWidth={2} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[var(--foreground)] tabular-nums">
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
                            <Plus className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carbon Calculator Summary in Drawer */}
              <div className="pt-2">
                <CarbonCalculatorCard
                  impact={impact}
                  points={estimatedPoints}
                  variant="compact"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border)] p-4 sm:p-5 bg-[var(--secondary)]/40">
            <div className="flex justify-between items-center mb-1 text-xs text-[var(--muted-foreground)]">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-[var(--foreground)] tabular-nums">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4 text-xs font-semibold text-[var(--primary)]">
              <span>Perolehan Eco Points</span>
              <span className="tabular-nums">+{estimatedPoints} Poin</span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] py-3 text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>

              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] py-2.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                Buka Halaman Keranjang Lengkap
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
