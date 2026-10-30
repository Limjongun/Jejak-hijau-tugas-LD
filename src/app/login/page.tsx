"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/stores/auth-store";
import { GoogleAuthButton } from "@/components/google-auth-button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams?.get("error");
  const { syncFromDatabase, login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adminNotice, setAdminNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (urlError) {
      if (urlError === "token_exchange_failed") {
        setErrorMessage("Gagal menghubungkan otorisasi Google. Pastikan Client ID dan Secret sudah sinkron.");
      } else if (urlError === "fetch_userinfo_failed") {
        setErrorMessage("Gagal mengambil profil akun Google.");
      } else {
        setErrorMessage(`Kendala masuk Google: ${urlError}`);
      }
    }
  }, [urlError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setAdminNotice(false);

    if (!email || !password) return;

    // Deteksi jika kredensial admin mencoba masuk di portal pelanggan
    if (email.toLowerCase().includes("admin")) {
      setAdminNotice(true);
      return;
    }

    setLoading(true);
    try {
      const userData = await syncFromDatabase(email);

      // 1. Tolak jika akun TIDAK DITEMUKAN di database
      if (!userData) {
        setErrorMessage(
          "Akun dengan email ini belum terdaftar di database JejakHijau. Silakan mendaftar akun baru terlebih dahulu."
        );
        return;
      }

      // 2. Jika akun adalah ADMIN, wajib masuk lewat portal keamanan admin
      if (userData.role === "ADMIN") {
        setAdminNotice(true);
        return;
      }

      // 3. Akun terverifikasi ada di database, arahkan ke dashboard
      router.push("/account");
    } catch (e) {
      setErrorMessage("Terjadi kendala saat memverifikasi akun. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Autentikasi Pelanggan
            </span>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Masuk ke JejakHijau
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Akses riwayat pesanan hijau, saldo Eco Points, dan sertifikat pohon asuh Anda.
            </p>
          </div>

          {/* Admin Notice Warning Box if Admin tries to login here */}
          {adminNotice && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-xs space-y-2 text-amber-900 dark:text-amber-300">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Akun Pengawas Administrator Terdeteksi</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--foreground)]">
                Demi standar keamanan operasional, akun administrator tidak dapat masuk melalui formulir pelanggan publik.
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:underline pt-1"
              >
                <span>Buka Portal Masuk Administrator →</span>
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          {/* Login Card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-xs space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Alamat Email Pelanggan
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-[var(--foreground)]">
                    Kata Sandi
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-[var(--border)] accent-[var(--primary)]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs text-[var(--muted-foreground)] cursor-pointer"
                >
                  Ingat perangkat ini selama 30 hari
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-[var(--border)]" />
              <span className="absolute bg-[var(--card)] px-3 text-[11px] font-medium text-[var(--muted-foreground)]">
                atau
              </span>
            </div>

            {/* Google Console Dev SSO Component */}
            <GoogleAuthButton redirectUrl="/account" />
          </div>

          {/* Register Link */}
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Belum memiliki akun JejakHijau?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              Daftar sekarang & raih Eco Points
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
