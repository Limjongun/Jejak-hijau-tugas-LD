"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Package,
  TreePine,
  Shield,
  ArrowRight,
  Leaf,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatRupiah } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams?.get("email");
  const queryName = searchParams?.get("name");
  const queryRole = (searchParams?.get("role") as any) || "CUSTOMER";
  const queryPoints = searchParams?.get("points") ? parseInt(searchParams.get("points")!) : 100;
  const isSsoGoogle = searchParams?.get("sso") === "google";

  const { user: authUser, logout, login } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Jika kembali dari Google OAuth SSO, segera simpan ke auth store
  useEffect(() => {
    if (isSsoGoogle && queryEmail) {
      login(
        queryEmail,
        queryRole,
        queryName || queryEmail.split("@")[0],
        queryPoints
      );
    }
  }, [isSsoGoogle, queryEmail, queryName, queryRole, queryPoints, login]);

  // Deteksi email aktif dari query param (SSO Google) atau authUser store
  const activeEmail = queryEmail || authUser?.email;

  useEffect(() => {
    async function loadAccountData() {
      if (!activeEmail) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let localOrders: any[] = [];
      try {
        const saved = localStorage.getItem("jh-local-orders");
        if (saved) localOrders = JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse local orders:", err);
      }

      try {
        const [ordRes, accRes] = await Promise.all([
          fetch(`/api/orders?email=${encodeURIComponent(activeEmail)}`),
          fetch(`/api/account?email=${encodeURIComponent(activeEmail)}`),
        ]);

        if (accRes.ok) {
          const accData = await accRes.json();
          setDbUser(accData);

          // Jika login via SSO Google baru saja diarahkan, sinkronkan auth-store
          if (!authUser || authUser.email !== accData.email) {
            login(
              accData.email,
              accData.role,
              accData.name,
              accData.points,
              accData.phone
            );
          }
        } else if (authUser) {
          // Fallback dari auth-store
          setDbUser({
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone || "+62 812-3456-7890",
            role: authUser.role,
            points: authUser.points,
            totalCo2Kg: 12.8,
            totalPlastic: 24,
            hasPassword: false,
            isGoogleAuth: true,
            memberSince: authUser.memberSince || "Oktober 2026",
            ordersCount: localOrders.length,
            donatedTreesCount: 1,
          });
        }

        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (Array.isArray(ordData) && ordData.length > 0) {
            // Gabungkan order database dan local orders unik
            const combined = [...ordData];
            for (const lo of localOrders) {
              if (!combined.some((c) => c.orderNumber === lo.orderNumber)) {
                combined.push(lo);
              }
            }
            setOrders(combined);
          } else {
            setOrders(localOrders);
          }
        } else {
          setOrders(localOrders);
        }
      } catch (e) {
        console.warn("API account offline, using local session & orders:", e);
        setOrders(localOrders);
        if (authUser) {
          setDbUser({
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone || "+62 812-3456-7890",
            role: authUser.role,
            points: authUser.points,
            totalCo2Kg: 12.8,
            totalPlastic: 24,
            hasPassword: false,
            isGoogleAuth: true,
            memberSince: authUser.memberSince || "Oktober 2026",
            ordersCount: localOrders.length,
            donatedTreesCount: 1,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [activeEmail]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Tampilan loading awal
  if (loading && !authUser && !dbUser) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
            <span>Memverifikasi sesi Google...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Tampilan jika belum login dan tidak ada query email dari SSO
  if (!loading && !authUser && !dbUser && !queryEmail) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Navbar />
        <main className="flex-1 py-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Anda Belum Masuk</h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Silakan masuk ke akun Anda untuk melihat profil, akumulasi poin keberlanjutan, dan riwayat pesanan.
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

  const user = dbUser || authUser || {
    name: "Pelanggan JejakHijau",
    email: activeEmail || "user@jejakhijau.id",
    role: "CUSTOMER",
    phone: "-",
    memberSince: "Oktober 2026",
    ecoPoints: 100,
    totalCo2Kg: 0,
    totalPlastic: 0,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* User Profile Card: Solid, Elegant Forest */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)] font-bold">
                  <User className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-[var(--foreground)]">
                      {user.name}
                    </h1>
                    <span className="rounded-sm bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {user.email} • {user.phone || "-"}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                    Anggota sejak {user.memberSince || "Oktober 2026"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/40 px-3.5 py-2">
                  <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">
                    Eco Points
                  </div>
                  <div className="text-lg font-bold text-[var(--primary)] tabular-nums">
                    {user.points || user.ecoPoints || 100} Pts
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>

          {/* Impact Quick Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                Total Reduksi Emisi Karbon
              </span>
              <div className="mt-1 text-2xl font-bold text-[var(--primary)] tabular-nums">
                {(user.totalCo2Kg || 0).toFixed(1)} kg CO₂e
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                Dihitung dari seluruh produk & kemasan ramah lingkungan
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                Sampah Plastik Dihindari
              </span>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
                {user.totalPlastic || 0} pcs
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                Penggantian plastik sekali pakai ke kemasan komposter
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                Pohon Teradopsi
              </span>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)] tabular-nums">
                {user.donatedTreesCount || 0} Pohon
              </div>
              <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                Bekerja sama dengan inisiatif reboisasi Tahura
              </p>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/account/impact"
              className="flex items-center gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
                <TreePine className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  Dampak Lingkungan Lengkap
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Lihat sertifikat & grafik pohon asuh
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
                <Package className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  Keranjang & Kalkulator
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Kelola produk hijau aktif
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
            </Link>

            {user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="flex items-center gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
                  <Shield className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    Portal Backoffice Admin
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Manajemen katalog & pesanan
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            ) : (
              <Link
                href="/products"
                className="flex items-center gap-3.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)] transition-colors group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
                  <Leaf className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    Katalog Ramah Lingkungan
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Jelajahi produk hemat karbon baru
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            )}
          </div>

          {/* Orders History Section */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                Riwayat Pesanan
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Daftar transaksi belanja ramah lingkungan Anda
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] py-8 text-center space-y-2">
                <Package className="h-8 w-8 text-[var(--muted-foreground)] mx-auto" />
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  Belum ada pesanan
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Mulai belanja produk berkelanjutan dan dapatkan reduksi emisi karbon nyata.
                </p>
                <Link
                  href="/products"
                  className="inline-flex mt-2 items-center gap-1.5 rounded-md bg-[var(--primary)] px-3.5 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <span>Mulai Belanja</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--foreground)]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-bold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : order.status === "PAID"
                              ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {order.date} • {order.itemsCount || 1} produk • {order.courier || "Reguler"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-[var(--foreground)] tabular-nums">
                          {formatRupiah(order.total)}
                        </div>
                        <span className="text-[10px] text-[var(--primary)] font-semibold">
                          -{order.co2Saved || "0.0"} kg CO₂
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-[var(--background)]">
          <Navbar />
          <main className="flex-1 py-16 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
              <span>Memuat profil...</span>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
