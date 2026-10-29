"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, Check } from "lucide-react";
import { Product } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { EcoImpactBadge } from "./eco-impact-badge";
import { SdgBadge } from "./sdg-badge";
import { useCartStore } from "@/stores/cart-store";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <article
      className={`group flex flex-col justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] transition-colors duration-150 hover:border-[var(--primary)] ${className}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[var(--secondary)] rounded-t-[7px] border-b border-[var(--border)]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <img
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </Link>

        {/* Status Tag on top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="rounded-sm bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Diskon
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-sm bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)] uppercase tracking-wider">
              Pilihan Editor
            </span>
          )}
        </div>

        {/* SDG Badges on top right */}
        <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1 justify-end z-10 max-w-[120px]">
          {product.sdgIds.slice(0, 2).map((sdgId) => (
            <SdgBadge key={sdgId} sdgId={sdgId} />
          ))}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Eco Impact Tag */}
        <div className="mb-2.5">
          <EcoImpactBadge
            co2SavedKg={product.co2SavedKg}
            plasticSavedPcs={product.plasticSavedPcs}
            size="sm"
          />
        </div>

        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating and Sold */}
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted-foreground)] tabular-nums">
          <div className="flex items-center gap-1 text-[#c99a1e] font-medium">
            <Star className="h-3 w-3 fill-current" strokeWidth={1} />
            <span>{product.avgRating.toFixed(1)}</span>
          </div>
          <span>•</span>
          <span>{product.soldCount} terjual</span>
        </div>

        {/* Price and Cart Action */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-[var(--border)]">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-[var(--muted-foreground)] line-through tabular-nums">
                {formatRupiah(product.originalPrice!)}
              </span>
            )}
            <span className="text-base font-bold text-[var(--foreground)] tabular-nums">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              isAdded
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] hover:border-[var(--primary)]"
            } ${
              product.stock <= 0 ? "opacity-30 cursor-not-allowed" : "active:bg-[var(--primary-hover)]"
            }`}
          >
            {isAdded ? (
              <Check className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
