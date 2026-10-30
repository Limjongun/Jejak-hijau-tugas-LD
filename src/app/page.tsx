"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Recycle,
  Shirt,
  TreePine,
  Bike,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { SDGS, PRODUCTS, CATEGORIES } from "@/data/initial-data";
import type { Product, Category } from "@/types";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            setProducts(prodData);
          }
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategories(catData);
          }
        }
      } catch (e) {
        console.warn("Using offline fallback catalog on homepage:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured);

  const displayedProducts =
    selectedCategory === "all"
      ? (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8))
      : products.filter((p) => p.categoryId === selectedCategory || (p as any).categorySlug === selectedCategory);

  const categoryIcons: Record<string, React.ReactNode> = {
    "cat-1": <Sun className="h-4 w-4" strokeWidth={1.75} />,
    "cat-2": <Recycle className="h-4 w-4" strokeWidth={1.75} />,
    "cat-3": <Shirt className="h-4 w-4" strokeWidth={1.75} />,
    "cat-4": <TreePine className="h-4 w-4" strokeWidth={1.75} />,
    "cat-5": <Bike className="h-4 w-4" strokeWidth={1.75} />,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* HERO SECTION: Editorial, Rata Kiri, Asimetris, Tanpa Gradien / Tanpa Blob */}
        <section className="border-b border-[var(--border)] bg-[var(--card)] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Kolom Kiri: Judul Solid, Deskripsi Lugas, Tombol Nyata */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-block rounded-sm bg-[var(--secondary)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] border border-[var(--border)]">
                  Katalog Terkurasi • Target SDGs 13, 12, 7, 15
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] leading-[1.15] text-wrap">
                  Belanja yang Mengurangi{" "}
                  <span className="text-[var(--primary)] underline decoration-[var(--border)] decoration-2 underline-offset-8">
                    Jejak Karbon
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-xl leading-relaxed">
                  Platform belanja produk alternatif ramah lingkungan. Setiap barang dilengkapi estimasi kilogram CO₂ yang dihemat, opsi pengiriman kendaraan listrik, dan kemasan bebas plastik.
                </p>

                {/* Tombol Aksi: Solid, Tanpa Gradien, Ukuran 44px */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href="/products"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                  >
                    <span>Buka Katalog Produk</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>

                  <Link
                    href="/account/impact"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                  >
                    <span>Dashboard Dampak Lingkungan</span>
                  </Link>
                </div>

                {/* Ringkasan Fakta / Metrik Konkret (Bukan statistik palsu) */}
                <div className="pt-6 border-t border-[var(--border)] grid grid-cols-3 gap-3 max-w-md">
                  <div className="p-3 rounded-md border border-[var(--border)] bg-[var(--secondary)]/40">
                    <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums">
                      20 Produk
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Terkurasi ketat
                    </span>
                  </div>

                  <div className="p-3 rounded-md border border-[var(--border)] bg-[var(--secondary)]/40">
                    <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums">
                      5 Kategori
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Gaya hidup hijau
                    </span>
                  </div>

                  <div className="p-3 rounded-md border border-[var(--border)] bg-[var(--secondary)]/40">
                    <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums">
                      100%
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Bebas plastik sekali pakai
                    </span>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Kartu Produk Pilihan Nyata Bergaya Arsip Botani */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-[var(--secondary)] border border-[var(--border)] mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
                      alt="Paket Adopsi Bibit Pohon"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 rounded-sm bg-[var(--primary)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary-foreground)] uppercase tracking-wider">
                      Program Reboisasi
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--foreground)]">
                        Paket Adopsi Bibit Pohon Trembesi
                      </span>
                      <span className="font-bold text-[var(--foreground)] tabular-nums">
                        Rp50.000
                      </span>
                    </div>

                    <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/60 p-2.5 text-xs text-[var(--foreground)] space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--primary)]">
                          -20 kg CO₂ / tahun
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">
                          saat pohon dewasa
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Ditanam di kawasan konservasi dengan nomor seri dan koordinat GPS penanaman.
                      </p>
                    </div>

                    <Link
                      href="/products/paket-adopsi-bibit-pohon"
                      className="mt-3 block text-center rounded-md border border-[var(--border)] bg-[var(--secondary)] py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                    >
                      Lihat Detail Program Adopsi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 KATEGORI: Tata Letak Bersih & Terstruktur */}
        <section className="py-10 border-b border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Katalog Berdasarkan Kebutuhan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">
                  Kategori Produk
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>Lihat semua 20 produk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.categoryId === cat.id
                ).length;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(isSelected ? "all" : cat.id)
                    }
                    className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                        : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-md mb-2.5 ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-[var(--secondary)] text-[var(--foreground)]"
                      }`}
                    >
                      {categoryIcons[cat.id]}
                    </div>
                    <span className="text-xs font-bold leading-tight">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] mt-1 tabular-nums ${
                        isSelected
                          ? "text-[var(--secondary)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {count} produk
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRODUK UNGGULAN: Grid Kartu Produk Tanpa AI Hover Scale */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Pilihan Berkelanjutan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">
                  {selectedCategory === "all"
                    ? "Produk Pilihan Editor"
                    : categories.find((c: Category) => c.id === selectedCategory)?.name}
                </h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Data estimasi penghematan dihitung per unit pemakaian tahunan.
                </p>
              </div>

              {selectedCategory !== "all" && (
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline"
                >
                  Tampilkan Semua Unggulan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-6 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                <span>Lihat Seluruh 20 Produk di Katalog Lengkap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* PENJELASAN SDGS: Terstruktur & Berbobot */}
        <section className="py-12 border-t border-[var(--border)] bg-[var(--secondary)]/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mb-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Konteks Kebijakan
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">
                Pilar SDGs yang Didukung
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Setiap kategori produk dikaitkan dengan target Sustainable Development Goals (SDGs) PBB 2030.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SDGS.filter((s) => [13, 12, 7, 15].includes(s.id)).map((sdg) => (
                <div
                  key={sdg.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="rounded-sm px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: `${sdg.color}15`,
                          color: sdg.color,
                          border: `1px solid ${sdg.color}40`,
                        }}
                      >
                        SDG {sdg.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">
                      {sdg.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {sdg.description}
                    </p>
                  </div>

                  <Link
                    href={`/products?sdg=${sdg.id}`}
                    className="mt-4 pt-2.5 border-t border-[var(--border)] text-[11px] font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Produk terkait</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
