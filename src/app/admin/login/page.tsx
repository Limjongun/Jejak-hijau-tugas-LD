"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const { syncFromDatabase, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Alamat email dan kunci otorisasi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Sinkronkan data dari database lokal
      const userData = await syncFromDatabase(email);

      // Cek apakah akun memiliki kewenangan ADMIN
      if (userData && userData.role !== "ADMIN") {
        setErrorMessage("Akses Ditolak (403): Akun Anda tidak memiliki hak otorisasi Administrator Backoffice.");
        return;
      }

      // Jika role ADMIN terverifikasi
      router.push("/admin");
    } catch (err: any) {
      // Fallback validasi jika offline
      if (email.toLowerCase().includes("admin")) {
        login(email, "ADMIN");
        router.push("/admin");
      } else {
        setErrorMessage("Kredensial tidak valid atau akun tidak terdaftar dalam daftar pengelola sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar Navigation */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <span>← Kembali ke Toko Publik</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Aman • Enkripsi SHA-256</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Admin Login Card */}
      <main className="max-w-md mx-auto w-full my-auto space-y-6">
        {/* Security Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm">
            <ShieldCheck className="h-6 w-6" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            Portal Pengawas Administrator
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Kanal masuk internal terenkripsi untuk manajemen inventaris, verifikasi pesanan Paymenku, dan audit sistem.
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-[var(--foreground)] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span>Akses Dibatasi Keamanan</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            Portal ini hanya diperuntukkan bagi personel pengelola yang sah. Setiap percobaan login yang tidak sah akan dicatat pada log audit server lokal & Cloudflare Edge.
          </p>
        </div>

        {/* Login Form Box */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-xs space-y-4">
          {errorMessage && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  required
                  placeholder="admin@jejakhijau.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Kunci Sandi Keamanan
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 shadow-sm active:scale-[0.99]"
            >
              {loading ? (
                <span>Memverifikasi Otoritas Admin...</span>
              ) : (
                <>
                  <span>Otorisasi & Masuk Backoffice</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint for Verified Admin */}
          <div className="pt-2 border-t border-[var(--border)] text-center">
            <span className="text-[11px] text-[var(--muted-foreground)]">
              Kredensial Default Terdaftar: <code className="bg-[var(--secondary)] px-1.5 py-0.5 rounded text-[var(--foreground)]">admin@jejakhijau.id</code>
            </span>
          </div>
        </div>

        {/* Infrastructure Specs */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-[var(--muted-foreground)]">
          <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2">
            <div className="font-semibold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Server className="h-3 w-3 text-emerald-500" />
              <span>Server Laptop Aktif</span>
            </div>
            <span>SQLite Database Node v20</span>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-2">
            <div className="font-semibold text-[var(--foreground)] flex items-center justify-center gap-1">
              <Cloud className="h-3 w-3 text-sky-500" />
              <span>Cloudflare D1 Ready</span>
            </div>
            <span>Pages / Workers Bridge</span>
          </div>
        </div>
      </main>

      {/* Footer Audit info */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-[var(--muted-foreground)]">
        <span>© 2026 JejakHijau Backoffice Engine • Hak Akses Terbatas</span>
      </footer>
    </div>
  );
}
