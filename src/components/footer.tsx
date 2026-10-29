import React from "react";
import Link from "next/link";
import { Leaf, ShieldCheck, TreePine, PackageCheck } from "lucide-react";
import { SDGS } from "@/data/initial-data";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-colors">
      {/* Komitmen Operasional Hijau */}
      <div className="border-b border-[var(--border)] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)] mt-0.5">
                <Leaf className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Kurasi Terverifikasi
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                  Semua produk memiliki estimasi reduksi emisi atau sampah yang dapat diukur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)] mt-0.5">
                <PackageCheck className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Kemasan Bebas Plastik
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                  Karton daur ulang dengan pita perekat nabati tanpa selotip vinil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)] mt-0.5">
                <TreePine className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Donasi Reboisasi Nyata
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                  Penukaran poin menjadi bibit pohon lindung dengan koordinat GPS penanaman.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)] mt-0.5">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Kalkulasi Transparan
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                  Data dampak dicatat sebagai snapshot pada setiap faktur pembelian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info & SDGs */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
                <Leaf className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="text-base font-bold text-[var(--foreground)]">
                JejakHijau
              </span>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-md">
              Katalog e-commerce produk ramah lingkungan terkurasi untuk pasar Indonesia. Setiap pesanan mencantumkan estimasi emisi karbon yang berhasil dihindari dan mendukung target pembangunan berkelanjutan.
            </p>

            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                Pilar SDGs Terkait
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SDGS.map((sdg) => (
                  <span
                    key={sdg.id}
                    className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold border"
                    style={{
                      borderColor: `${sdg.color}50`,
                      color: sdg.color,
                      backgroundColor: `${sdg.color}10`,
                    }}
                  >
                    SDG {sdg.id}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Kategori
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link
                  href="/products?category=energi-bersih"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Energi Bersih
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=zero-waste"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Zero Waste
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=fashion-berkelanjutan"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Fashion Berkelanjutan
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=penghijauan"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Penghijauan & Kompos
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=transportasi-rendah-emisi"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Transportasi Rendah Emisi
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Halaman
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link
                  href="/account/impact"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Dashboard Dampak
                </Link>
              </li>
              <li>
                <Link
                  href="/learn"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Artikel & Panduan
                </Link>
              </li>
              <li>
                <Link
                  href="/sdgs"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Target SDGs PBB 2030
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Kebijakan Privasi & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted-foreground)] gap-2">
          <p>© 2026 JejakHijau. Seluruh hak cipta dilindungi.</p>
          <p>Dibuat untuk konsumsi dan produksi bertanggung jawab.</p>
        </div>
      </div>
    </footer>
  );
}
