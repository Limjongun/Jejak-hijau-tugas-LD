"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductCard } from "@/components/product-card";
import { SDGS, PRODUCTS, CATEGORIES } from "@/data/initial-data";
import type { Product, Category } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSdg, setSelectedSdg] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
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
      } catch (err) {
        console.warn("Using offline fallback catalog data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId === selectedCategory ||
        (product as any).categorySlug === selectedCategory;

      const matchesSdg =
        selectedSdg === null || (product.sdgIds && product.sdgIds.includes(selectedSdg));

      return matchesSearch && matchesCategory && matchesSdg;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "impact-co2") return b.co2SavedKg - a.co2SavedKg;
      if (sortBy === "impact-plastic")
        return b.plasticSavedPcs - a.plasticSavedPcs;
      if (sortBy === "rating") return b.avgRating - a.avgRating;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedSdg, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Katalog Lengkap
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-0.5">
              Daftar Produk Berkelanjutan
            </h1>
            <p className="mt-1 text-xs text-[var(--muted-foreground)] tabular-nums">
              Menampilkan {filteredProducts.length} dari 20 produk terkurasi.
            </p>
          </div>

          {/* Search & Filter Controls: Anti-slop clean panel */}
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder="Cari panel surya, tumbler, sikat gigi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 py-2 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" strokeWidth={1.75} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                >
                  <option value="featured">Urutan: Rekomendasi</option>
                  <option value="impact-co2">Dampak: CO₂ Terbesar</option>
                  <option value="impact-plastic">Dampak: Plastik Terbanyak</option>
                  <option value="price-low">Harga: Termurah</option>
                  <option value="price-high">Harga: Termahal</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1">
                Kategori:
              </span>
              <button
                onClick={() => setSelectedCategory("all")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* SDG Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1">
                Pilar SDG:
              </span>
              <button
                onClick={() => setSelectedSdg(null)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedSdg === null
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                }`}
              >
                Semua
              </button>
              {SDGS.map((sdg) => (
                <button
                  key={sdg.id}
                  onClick={() =>
                    setSelectedSdg(selectedSdg === sdg.id ? null : sdg.id)
                  }
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    selectedSdg === sdg.id ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedSdg === sdg.id ? sdg.color : `${sdg.color}15`,
                    borderColor: sdg.color,
                    color: selectedSdg === sdg.id ? "#ffffff" : sdg.color,
                  }}
                >
                  SDG {sdg.id}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border)] p-12 text-center bg-[var(--card)]">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Tidak ada produk yang sesuai filter
              </h3>
              <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-sm">
                Coba sesuaikan kata kunci atau bersihkan pilihan filter kategori dan SDG.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedSdg(null);
                }}
                className="mt-4 rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)]"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
