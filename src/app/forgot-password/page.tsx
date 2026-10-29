"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Leaf, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Pemulihan Akun
            </span>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Masukkan email yang terdaftar untuk menerima instruksi pemulihan.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7">
            {submitted ? (
              <div className="space-y-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--secondary)] text-[var(--primary)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    Instruksi Pemulihan Terkirim
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Kami telah mengirimkan tautan pemulihan kata sandi ke{" "}
                    <strong className="text-[var(--foreground)]">{email}</strong>. Periksa kotak masuk atau folder spam Anda.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Alamat Email Terdaftar
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

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] text-xs sm:text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span>Mengirimkan instruksi...</span>
                  ) : (
                    <>
                      <span>Kirim Tautan Pemulihan</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
