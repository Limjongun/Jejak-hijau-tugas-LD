"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SDGS } from "@/data/initial-data";

export default function SdgsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Hero SDGs: Left-aligned, authentic editorial */}
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Kerangka Kerja Keberlanjutan PBB 2030
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Peta Jalan & Integrasi SDGs di JejakHijau
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Setiap produk yang kami kurasi, kalkulator karbon di keranjang belanja, hingga opsi logistik niremisi dirancang dengan acuan langsung pada indikator Sustainable Development Goals (SDGs) PBB.
            </p>
          </div>

          {/* Detailed SDGs Cards: Clean 8px border, authentic editorial styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SDGS.map((sdg) => (
              <div
                key={sdg.id}
                className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 text-left"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-md text-white font-bold text-base shrink-0"
                    style={{ backgroundColor: sdg.color }}
                  >
                    {sdg.id}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                      Tujuan PBB Nomor {sdg.id}
                    </span>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      {sdg.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {sdg.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--foreground)]">
                    Penerapan Konkret di JejakHijau:
                  </span>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 p-3 text-xs text-[var(--foreground)] leading-relaxed">
                    {sdg.id === 13 &&
                      "Menyediakan label Eco Impact terukur (estimasi kg CO₂ dihemat), kalkulator jejak karbon di keranjang, dan dashboard progres reduksi emisi."}
                    {sdg.id === 12 &&
                      "Katalog produk zero-waste bebas plastik sekali pakai, opsi kemasan tanpa plastik, dan kurasi barang dari bahan baku daur ulang (banner bekas, ban)."}
                    {sdg.id === 7 &&
                      "Koleksi produk bertenaga surya (panel surya portable, power bank solar, lampu solar LED) dan smart plug penghemat energi."}
                    {sdg.id === 15 &&
                      "Program konversi Eco Points menjadi donasi bibit pohon (Trembesi & Mahoni) dengan sertifikat dan titik koordinat GPS konservasi."}
                    {sdg.id === 2 &&
                      "Penyediaan starter kit hidroponik rumahan untuk mendukung ketahanan pangan sayur mandiri keluarga perkotaan."}
                    {sdg.id === 11 &&
                      "Mendorong mobilitas niremisi lewat sepeda lipat urban commuter dan opsi kurir armada kendaraan listrik (Green Delivery)."}
                  </div>
                </div>

                <div className="mt-4 pt-1">
                  <Link
                    href={`/products?sdg=${sdg.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    <span>Katalog produk terkait SDG {sdg.id}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Callout: Solid forest green, no gradient */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--primary)] p-6 sm:p-8 text-[var(--primary-foreground)] space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold">
              Belanja yang Bertanggung Jawab Dimulai dari Pilihan Sadar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--primary-foreground)]/90 max-w-2xl leading-relaxed">
              JejakHijau membantu Anda memilih alternatif barang harian yang minim limbah, teruji kualitasnya, dan mencatat kontribusi nyata terhadap kelestarian lingkungan.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 h-10 rounded-md bg-[var(--background)] px-5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                <span>Jelajahi 20 Produk Berkelanjutan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
