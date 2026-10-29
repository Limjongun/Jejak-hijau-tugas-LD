"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, User, Mail, Lock, ArrowRight, Award } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/stores/auth-store";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { text: "", score: 0 };
    if (password.length < 6) return { text: "Terlalu Pendek", score: 1, color: "bg-[var(--accent)]" };
    if (password.length < 10) return { text: "Cukup", score: 2, color: "bg-amber-600" };
    return { text: "Kuat & Aman", score: 3, color: "bg-[var(--primary)]" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !email || !password) return;
    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal mendaftarkan akun baru.");
        return;
      }

      // Berhasil mendaftar di SQLite, aktifkan sesi login
      login(data.email, "CUSTOMER", data.name, data.points);
      router.push("/account");
    } catch (err: any) {
      setErrorMessage("Terjadi gangguan koneksi saat mendaftarkan akun.");
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
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Pendaftaran Akun
            </span>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Bergabung dengan JejakHijau
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Mulai aksi nyata pengurangan jejak karbon belanja Anda hari ini.
            </p>
          </div>

          {/* Welcome Bonus Callout */}
          <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3.5 text-xs text-[var(--foreground)]">
            <Award className="h-4 w-4 text-[var(--primary)] shrink-0" />
            <span>
              <strong>Bonus Registrasi:</strong> Dapatkan langsung <strong>+100 Eco Points</strong> pertama untuk belanja atau adopsi pohon.
            </span>
          </div>

          {/* Registration Card */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 space-y-4">
            {errorMessage && (
              <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Alamat Email
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
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex gap-1 h-1 flex-1 max-w-[120px] mr-2">
                      <div
                        className={`h-full rounded-sm flex-1 ${
                          strength.score >= 1 ? strength.color : "bg-[var(--border)]"
                        }`}
                      />
                      <div
                        className={`h-full rounded-sm flex-1 ${
                          strength.score >= 2 ? strength.color : "bg-[var(--border)]"
                        }`}
                      />
                      <div
                        className={`h-full rounded-sm flex-1 ${
                          strength.score >= 3 ? strength.color : "bg-[var(--border)]"
                        }`}
                      />
                    </div>
                    <span className="text-[var(--muted-foreground)] text-[10px]">
                      Kekuatan: {strength.text}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Ulangi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex items-start pt-1">
                <input
                  id="eco-pledge"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm border-[var(--border)] accent-[var(--primary)]"
                />
                <label
                  htmlFor="eco-pledge"
                  className="ml-2 block text-xs text-[var(--muted-foreground)] leading-snug cursor-pointer"
                >
                  Saya menyetujui Ketentuan Layanan & Kebijakan Privasi serta berkomitmen mendukung konsumsi berkelanjutan.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span>Mendaftarkan akun...</span>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
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

            {/* Google Quick Registration */}
            <GoogleAuthButton
              redirectUrl="/account"
              buttonText="Daftar Cepat dengan Google"
            />
          </div>

          {/* Login Link */}
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Sudah memiliki akun JejakHijau?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
