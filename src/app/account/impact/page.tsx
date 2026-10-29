"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TreePine,
  Wind,
  Trash2,
  CheckCircle2,
  MapPin,
  Calendar,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BADGES } from "@/data/initial-data";
import { TREE_DONATION_POINTS } from "@/lib/eco-impact";
import { useAuthStore } from "@/stores/auth-store";

export default function ImpactDashboardPage() {
  const { user } = useAuthStore();
  const currentUserEmail = user?.email || "user@jejakhijau.id";

  const [points, setPoints] = useState(750);
  const [totalCo2, setTotalCo2] = useState(48.5);
  const [totalPlastic, setTotalPlastic] = useState(320);
  const [donatedTrees, setDonatedTrees] = useState<any[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const [accRes, treeRes] = await Promise.all([
        fetch(`/api/account?email=${currentUserEmail}`),
        fetch(`/api/trees?email=${currentUserEmail}`),
      ]);
      if (accRes.ok) {
        const acc = await accRes.json();
        setPoints(acc.points);
        setTotalCo2(acc.totalCo2Kg);
        setTotalPlastic(acc.totalPlastic);
      }
      if (treeRes.ok) {
        const trees = await treeRes.json();
        setDonatedTrees(trees);
      }
    } catch (e) {
      console.error("Failed to load impact data:", e);
    }
  }, [currentUserEmail]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRedeemTree = async () => {
    if (points < TREE_DONATION_POINTS || redeemLoading) return;
    setRedeemLoading(true);

    try {
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          treeType: "Trembesi",
          quantity: 1,
          location: "Tahura Juanda, Bandung",
        }),
      });

      if (res.ok) {
        setRedeemSuccess(true);
        await loadData();
        setTimeout(() => setRedeemSuccess(false), 3500);
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengadopsi pohon.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat memproses donasi pohon.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const donatedTreesCount = donatedTrees.length;

  const progressToTree = Math.min(
    100,
    Math.round(((points % TREE_DONATION_POINTS) / TREE_DONATION_POINTS) * 100)
  );

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <TreePine className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Akses Dashboard Dampak</h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Silakan masuk ke akun Anda untuk memantau metrik reduksi karbon, poin keberlanjutan, dan pohon asuh yang Anda tanam.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-colors shadow-xs"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                Daftar Baru
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Laporan Perorangan
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-0.5">
                Dashboard Dampak & Eco Points
              </h1>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Catatan akumulasi penghematan karbon dan donasi pohon asuh Anda.
              </p>
            </div>

            {/* Eco Points Box */}
            <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-[var(--foreground)]">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Saldo Eco Points
                </span>
                <div className="text-xl font-bold text-[var(--foreground)] tabular-nums">
                  {points.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-normal text-[var(--muted-foreground)]">Poin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success notification */}
          {redeemSuccess && (
            <div className="flex items-center gap-2.5 rounded-md border border-[var(--primary)] bg-[var(--secondary)] p-3 text-xs text-[var(--primary)]">
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span>
                1 Bibit Pohon Trembesi berhasil diadopsi. Bibit akan disalurkan ke mitra konservasi hutan.
              </span>
            </div>
          )}

          {/* Impact Metrics 3 Cards Grid: Clean solid border */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: CO2 Saved */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Total CO₂ Dihemat
                </span>
                <Wind className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.75} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums">
                {totalCo2}{" "}
                <span className="text-xs font-normal text-[var(--muted-foreground)]">
                  kg
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Setara dengan mematikan emisi komuter motor bensin sejauh {Math.round(totalCo2 / 0.1)} km.
              </p>
            </div>

            {/* Card 2: Plastic Avoided */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Plastik Dicegah
                </span>
                <Trash2 className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums">
                {totalPlastic}{" "}
                <span className="text-xs font-normal text-[var(--muted-foreground)]">
                  pcs
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Kemasan dan botol plastik sekali pakai yang berhasil dihindarkan.
              </p>
            </div>

            {/* Card 3: Trees Planted */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Pohon Asuh
                </span>
                <TreePine className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.75} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums">
                {donatedTreesCount}{" "}
                <span className="text-xs font-normal text-[var(--muted-foreground)]">
                  pohon
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                Menyerap estimasi {donatedTreesCount * 20} kg CO₂ per tahun saat dewasa.
              </p>
            </div>
          </div>

          {/* Tree Redemption & Points Progress Box */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Program Reboisasi
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                  Tukar 500 Eco Points Menjadi 1 Bibit Pohon Asuh
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xl">
                  Poin yang Anda kumpulkan dapat dikonversi menjadi donasi bibit pohon Trembesi atau Mahoni di kawasan hutan lindung dengan koordinat GPS penanaman.
                </p>

                {/* Progress bar */}
                <div className="pt-2 max-w-md">
                  <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
                    <span>Progress ke pohon berikutnya:</span>
                    <span className="font-semibold text-[var(--foreground)] tabular-nums">
                      {points % TREE_DONATION_POINTS} / 500 Poin
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--secondary)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] transition-all duration-300"
                      style={{ width: `${progressToTree}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-4 lg:pt-0 lg:pl-6">
                <button
                  onClick={handleRedeemTree}
                  disabled={points < TREE_DONATION_POINTS}
                  className="h-10 rounded-md bg-[var(--primary)] px-5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-40 transition-colors"
                >
                  Tukar 500 Poin Sekarang
                </button>
              </div>
            </div>
          </div>

          {/* Eco Badges Trophy Showcase */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Pencapaian Konsumen
              </span>
              <h2 className="text-lg font-bold text-[var(--foreground)] mt-0.5">
                Koleksi Eco Badges
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {BADGES.map((badge, idx) => {
                const isUnlocked = idx < 4;

                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col rounded-lg border p-4 text-left transition-colors ${
                      isUnlocked
                        ? "border-[var(--border)] bg-[var(--card)]"
                        : "border-[var(--border)] bg-[var(--secondary)]/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {badge.name}
                      </span>
                      {isUnlocked && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={2} />
                      )}
                    </div>

                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="mt-auto pt-3 border-t border-[var(--border)]">
                      <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                        {badge.requiredMetric}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Planted Trees Evidence Log */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Dokumentasi Penanaman Pohon Asuh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {donatedTrees.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-xs text-[var(--muted-foreground)]">
                  Belum ada riwayat bibit pohon yang diadopsi. Tukar 500 Eco Points Anda untuk menanam bibit pohon pertama.
                </div>
              ) : (
                donatedTrees.map((t, idx) => (
                  <div key={t.id || idx} className="flex gap-3 rounded-md border border-[var(--border)] p-3 bg-[var(--secondary)]/30">
                    <img
                      src={t.proofImage || (t.type === "Trembesi" ? "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80" : "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80")}
                      alt={`Bibit ${t.type}`}
                      className="h-18 w-18 shrink-0 rounded-md object-cover border border-[var(--border)]"
                    />
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--foreground)]">
                          {t.quantity}x Bibit {t.type}
                        </span>
                        <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          t.status === "PLANTED"
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                        <MapPin className="h-3 w-3 text-[var(--primary)]" />
                        <span>{t.location} {t.gpsCoordinates && `(GPS: ${t.gpsCoordinates})`}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                        <Calendar className="h-3 w-3 text-[var(--primary)]" />
                        <span>{t.status === "PLANTED" && t.plantedAt ? `Ditanam: ${t.plantedAt}` : `Diajukan: ${t.requestedAt}`}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
