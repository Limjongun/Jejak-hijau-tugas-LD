"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Building, CheckCircle2, Copy, Check, Clock, ShieldCheck, X, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: string;
  orderNumber?: string;
  onConfirmSuccess: () => Promise<void> | void;
}

export function PaymentSimulationModal({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  orderNumber = "JH-20261029-XXXX",
  onConfirmSuccess,
}: PaymentSimulationModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(899); // 14:59

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const vaNumber = "8277 0812 3456 7890";

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      await onConfirmSuccess();
    } catch (err: any) {
      console.error("Payment simulation error:", err);
      alert(err?.message || "Gagal memproses pesanan ke database.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--secondary)]/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Gerbang Pembayaran Paymenku & QRIS
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Kanal Pembayaran Resmi Terenkripsi 256-Bit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Amount & Timer Box */}
          <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/20 p-4 text-center space-y-1">
            <span className="text-[11px] text-[var(--muted-foreground)]">Total Tagihan</span>
            <div className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
              {formatRupiah(amount)}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
              <Clock className="h-3 w-3" />
              <span>Selesaikan dalam {timeFormatted}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === "qris" ? (
            <div className="flex flex-col items-center justify-center p-3 rounded-md border border-[var(--border)] bg-[var(--card)] space-y-2">
              <span className="text-[11px] font-bold tracking-wider text-[var(--muted-foreground)] uppercase">
                QRIS Standar Nasional Indonesia
              </span>
              {/* Dynamic Crisp SVG QR Code */}
              <div className="relative bg-white p-3 rounded-md border border-gray-200 shadow-xs">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  className="w-40 h-40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect width="180" height="180" fill="white" />
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="45" height="45" fill="#1F3D2B" />
                  <rect x="17" y="17" width="31" height="31" fill="white" />
                  <rect x="24" y="24" width="17" height="17" fill="#1F3D2B" />
                  {/* Top-Right Finder */}
                  <rect x="125" y="10" width="45" height="45" fill="#1F3D2B" />
                  <rect x="132" y="17" width="31" height="31" fill="white" />
                  <rect x="139" y="24" width="17" height="17" fill="#1F3D2B" />
                  {/* Bottom-Left Finder */}
                  <rect x="10" y="125" width="45" height="45" fill="#1F3D2B" />
                  <rect x="17" y="132" width="31" height="31" fill="white" />
                  <rect x="24" y="139" width="17" height="17" fill="#1F3D2B" />
                  {/* QR Pattern Blocks */}
                  <rect x="65" y="15" width="10" height="10" fill="#1F3D2B" />
                  <rect x="85" y="15" width="20" height="10" fill="#1F3D2B" />
                  <rect x="65" y="35" width="30" height="10" fill="#1F3D2B" />
                  <rect x="105" y="35" width="10" height="20" fill="#1F3D2B" />
                  <rect x="20" y="65" width="20" height="10" fill="#1F3D2B" />
                  <rect x="50" y="65" width="10" height="30" fill="#1F3D2B" />
                  <rect x="70" y="65" width="40" height="10" fill="#1F3D2B" />
                  <rect x="120" y="65" width="20" height="10" fill="#1F3D2B" />
                  <rect x="150" y="65" width="20" height="20" fill="#1F3D2B" />
                  <rect x="20" y="85" width="10" height="20" fill="#1F3D2B" />
                  <rect x="70" y="85" width="15" height="15" fill="#1F3D2B" />
                  <rect x="95" y="85" width="15" height="15" fill="#1F3D2B" />
                  <rect x="120" y="85" width="15" height="25" fill="#1F3D2B" />
                  <rect x="20" y="110" width="30" height="10" fill="#1F3D2B" />
                  <rect x="65" y="110" width="20" height="10" fill="#1F3D2B" />
                  <rect x="95" y="110" width="15" height="20" fill="#1F3D2B" />
                  <rect x="140" y="110" width="30" height="10" fill="#1F3D2B" />
                  <rect x="65" y="130" width="15" height="15" fill="#1F3D2B" />
                  <rect x="120" y="130" width="20" height="20" fill="#1F3D2B" />
                  <rect x="150" y="130" width="20" height="20" fill="#1F3D2B" />
                  <rect x="65" y="155" width="25" height="15" fill="#1F3D2B" />
                  <rect x="100" y="155" width="20" height="15" fill="#1F3D2B" />
                  <rect x="130" y="155" width="40" height="15" fill="#1F3D2B" />
                  {/* Center Eco Logo Badge */}
                  <circle cx="90" cy="90" r="16" fill="#1F3D2B" />
                  <path
                    d="M86 92C86 86 92 84 95 84C95 87 93 93 90 94C88 94.6 86 93.6 86 92Z"
                    fill="#F4F1E8"
                  />
                </svg>
              </div>
              <div className="text-center text-[10px] text-[var(--muted-foreground)]">
                NMID: ID1020261908234 • PT JEJAK HIJAU NUSANTARA
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  Nomor Virtual Account BCA
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-sm">
                  Otomatis
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                <span className="text-sm font-bold text-[var(--foreground)] tabular-nums tracking-wider">
                  {vaNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Transfer dapat dilakukan dari ATM, m-Banking (BCA, Mandiri, BNI, BRI), atau e-Wallet apapun.
              </p>
            </div>
          )}

          {/* Official Payment Note */}
          <div className="rounded-md bg-[var(--secondary)]/40 p-3 text-[11px] text-[var(--muted-foreground)] space-y-1 border border-[var(--border)]">
            <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Instruksi Transaksi Paymenku:</span>
            </div>
            <p>
              Pindai kode QRIS menggunakan e-wallet atau mobile banking Anda, atau transfer sesuai nominal ke nomor Virtual Account. Sistem akan memverifikasi mutasi transaksi secara otomatis dan aman.
            </p>
          </div>

          {/* Action Confirmation Button */}
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleSimulatePayment}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] py-3 text-xs font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-md transition-all active:scale-[0.98]"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi Mutasi Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Saya Sudah Membayar (Konfirmasi Pembayaran)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
