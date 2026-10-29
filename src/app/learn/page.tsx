"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import articlesData from "@/data/articles.json";

export default function LearnPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="max-w-2xl space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Jurnal & Edukasi Keberlanjutan</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
              Panduan Praktis Aksi Iklim
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              Kumpulan artikel riset, wawasan sains, dan tips harian untuk membantu Anda menurunkan emisi karbon belanja.
            </p>
          </div>

          {/* Articles Grid: 8px radius, clean 1px border, no scale-105 on hover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articlesData.map((art) => (
              <Link
                key={art.id}
                href={`/learn/${art.slug}`}
                className="group flex flex-col rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] transition-all"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-[var(--secondary)]">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="h-full w-full object-cover group-hover:opacity-95 transition-opacity"
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    {art.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {art.readTime}
                    </span>
                    <span>•</span>
                    <span>{art.date}</span>
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug">
                    {art.title}
                  </h2>

                  <p className="mt-2 text-xs text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>

                  <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Eco Quote Banner */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Konsumsi Bertanggung Jawab (SDG 12)</span>
              </span>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Siap mempraktikkan gaya hidup rendah emisi?
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                Temukan 20 produk terkurasi ramah lingkungan yang hemat energi dan bebas plastik di katalog kami.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-[var(--primary)] px-5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors shadow-xs shrink-0"
            >
              <span>Jelajahi Katalog Hijau</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
