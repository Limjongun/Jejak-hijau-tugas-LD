"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  PackageCheck,
  TreePine,
  Wind,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { SdgBadge } from "@/components/sdg-badge";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS, CATEGORIES } from "@/data/initial-data";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "impact" | "shipping">(
    "desc"
  );
  const [isAdded, setIsAdded] = useState(false);

  React.useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          const relRes = await fetch(`/api/products?category=${data.categorySlug}&limit=5`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedProducts(relData.filter((r: any) => r.id !== data.id).slice(0, 4));
          }
        }
      } catch (e) {
        console.error("Failed to load product detail:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center py-20 text-xs text-[var(--muted-foreground)]">
          Memuat data produk dari database...
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Produk Tidak Ditemukan
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Produk yang Anda cari tidak tersedia dalam katalog aktif.
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)]"
          >
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const category = { id: product.categoryId, name: product.categoryName, slug: product.categorySlug };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation: Sederhana & Fungsional */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Link
              href="/"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Beranda
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Katalog
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="font-semibold text-[var(--foreground)] truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          {/* Product Overview Grid: 7:5 Asymmetrical */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left: Product Image */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />

                {product.isFeatured && (
                  <div className="absolute top-3 left-3 rounded-sm bg-[var(--primary)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary-foreground)] uppercase tracking-wider">
                    Pilihan Editor
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details & Order Box */}
            <div className="lg:col-span-6 flex flex-col">
              {/* SDG Badges List */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {product.sdgIds.map((sdgId: number) => (
                  <SdgBadge key={sdgId} sdgId={sdgId} showName />
                ))}
              </div>

              {/* Title & SKU */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-snug">
                {product.name}
              </h1>
              <span className="mt-1 text-xs text-[var(--muted-foreground)]">
                SKU: {product.sku} • Kategori: {category?.name}
              </span>

              {/* Rating and Sold */}
              <div className="mt-3 flex items-center gap-2.5 text-xs text-[var(--muted-foreground)] tabular-nums">
                <div className="flex items-center gap-1 text-[#c99a1e] font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={1} />
                  <span>{product.avgRating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{product.reviewCount} ulasan</span>
                <span>•</span>
                <span>{product.soldCount} terjual</span>
              </div>

              {/* Price Banner: Bersih, tabular-nums */}
              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums">
                    {formatRupiah(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-[var(--muted-foreground)] line-through tabular-nums">
                      {formatRupiah(product.originalPrice!)}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-[var(--muted-foreground)] tabular-nums">
                  Dapatkan estimasi +{Math.floor(product.price / 1000)} Eco Points dari transaksi ini.
                </div>
              </div>

              {/* Eco Impact Spotlight: Tabel Spesifikasi Kemasan */}
              <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 p-4 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Estimasi Dampak Terukur (Per Unit / Tahun)
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {product.co2SavedKg > 0 && (
                    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <Wind className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.75} />
                        <span>CO₂ Dihemat</span>
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-[var(--foreground)] tabular-nums">
                        -{product.co2SavedKg} kg/thn
                      </div>
                    </div>
                  )}

                  {product.plasticSavedPcs > 0 && (
                    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <Trash2 className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                        <span>Plastik Berkurang</span>
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-[var(--foreground)] tabular-nums">
                        -{product.plasticSavedPcs} pcs
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[var(--foreground)] leading-relaxed italic border-t border-[var(--border)] pt-2">
                  "{product.impactNote}"
                </p>
              </div>

              {/* Quantity and Actions */}
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    Jumlah:
                  </span>
                  <div className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] p-0.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Kurangi kuantitas"
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[var(--foreground)] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                      aria-label="Tambah kuantitas"
                      className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    Tersedia {product.stock} unit
                  </span>
                </div>

                {/* Action Buttons: 44px height, solid primary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-xs sm:text-sm font-semibold transition-colors ${
                      isAdded
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2} />
                        <span>Ditambahkan ke Keranjang</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
                        <span>Tambah ke Keranjang</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="mt-12 border-t border-[var(--border)] pt-6">
            <div className="flex border-b border-[var(--border)] gap-6">
              <button
                onClick={() => setActiveTab("desc")}
                className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "desc"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Deskripsi Produk
              </button>
              <button
                onClick={() => setActiveTab("impact")}
                className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "impact"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Riset & Target SDGs
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "shipping"
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Standar Pengiriman & Kemasan
              </button>
            </div>

            <div className="py-5 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed max-w-2xl">
              {activeTab === "desc" && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs space-y-1">
                    <div>• Berat Barang: {product.weightGram} gram</div>
                    <div>• Kategori: {category?.name}</div>
                    <div>• Status: Terverifikasi ramah lingkungan</div>
                  </div>
                </div>
              )}

              {activeTab === "impact" && (
                <div className="space-y-2">
                  <p>
                    Data estimasi dampak produk ini diturunkan dari kalkulasi siklus pakai:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reduksi emisi: -{product.co2SavedKg} kg CO₂ per tahun masa pakai.</li>
                    {product.plasticSavedPcs > 0 && (
                      <li>Pencegahan sampah plastik: -{product.plasticSavedPcs} unit sampah sekali pakai.</li>
                    )}
                    <li>
                      SDGs terkait: {product.sdgIds.map((id: number) => `SDG ${id}`).join(", ")}.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--primary)]">
                    <PackageCheck className="h-4 w-4" strokeWidth={1.75} />
                    <span>Kemasan 100% Bebas Plastik</span>
                  </div>
                  <p className="text-[var(--muted-foreground)]">
                    Karton daur ulang dengan bantalan kertas sarang lebah (honeycomb) dan perekat nabati berbahan dasar pati singkong. Tersedia opsi kurir motor listrik di wilayah terjangkau.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 border-t border-[var(--border)] pt-8">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                Produk Sejenis dari Kategori {category?.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">
            Memuat data produk...
          </div>
        </div>
      }
    >
      <ProductDetailContent />
    </React.Suspense>
  );
}
