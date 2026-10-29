import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import articlesData from "@/data/articles.json";
import { ArticleShareButton } from "./share-button";

// Static prerendering parameters for Next.js 16
export function generateStaticParams() {
  return articlesData.map((art) => ({
    slug: art.slug,
  }));
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articlesData.find((a) => a.slug === slug);

  if (!article) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs & Back Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Kembali ke Jurnal Edukasi</span>
              </Link>
              <span>/</span>
              <span className="capitalize">{article.category}</span>
            </div>

            <ArticleShareButton />
          </div>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                {article.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readTime}</span>
              </div>
              <span className="text-[var(--muted-foreground)]">•</span>
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{article.date}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-normal">
              {article.excerpt}
            </p>

            {/* Author and Impact Potential Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)] font-bold">
                  <User className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                    {article.author}
                  </div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">
                    {article.authorRole}
                  </div>
                </div>
              </div>

              {article.co2PotentialReduction && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                  <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Potensi Reduksi Emisi</span>
                    <span className="font-bold text-xs">{article.co2PotentialReduction}</span>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Hero Featured Image */}
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--secondary)] shadow-xs">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 space-y-8 leading-relaxed">
            {article.content.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-sm">
                    {idx + 1}
                  </span>
                  <span>{section.heading}</span>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--foreground)]/90 leading-relaxed font-normal">
                  {section.body}
                </p>
              </section>
            ))}

            {/* Scientific Verification Note */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)]/40 p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                <span>Prinsip Kurasi & Verifikasi Sains JejakHijau</span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                Seluruh artikel dan rekomendasi panduan diuji silang terhadap data IPCC (Intergovernmental Panel on Climate Change) dan standar Kementerian Lingkungan Hidup dan Kehutanan (KLHK) Republik Indonesia untuk menjamin akurasi estimasi jejak karbon.
              </p>
            </div>

            {/* Topic Tags */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center gap-1 mr-1">
                <Tag className="h-3 w-3" />
                <span>Topik:</span>
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* Action Call to Action */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Aksi Nyata Berkelanjutan</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                Terapkan wawasan ini pada belanja harian Anda
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-xl">
                Setiap pembelian di JejakHijau otomatis menyertakan kalkulasi reduksi karbon transparan dan kemasan bersegel nabati tanpa plastik.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors shadow-xs shrink-0"
            >
              <span>Buka Katalog Produk</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
