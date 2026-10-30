"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface PaymenkuTransactionData {
  transactionId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "FAILED";
  payUrl?: string;
  qrisPayload?: string;
  qrisImageUrl?: string;
  vaNumber?: string;
  merchantName?: string;
  expiredAt: string;
}

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: string;
  orderNumber?: string;
  paymenkuData?: PaymenkuTransactionData | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onConfirmSuccess: () => Promise<void> | void;
}

export function PaymentSimulationModal({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  orderNumber = "JH-XXXX",
  paymenkuData,
  isLoading = false,
  errorMessage = null,
  onConfirmSuccess,
}: PaymentSimulationModalProps) {
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 default

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setStatusMessage(null);
      return;
    }

    if (paymenkuData?.expiredAt) {
      const exp = new Date(paymenkuData.expiredAt).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((exp - now) / 1000));
      setTimeLeft(diffSec > 0 ? diffSec : 900);
    } else {
      setTimeLeft(900);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, paymenkuData]);

  // Polling check status automatically every 4 seconds
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async (manual = false) => {
    if (!paymenkuData?.transactionId) return;
    if (manual) setIsChecking(true);

    try {
      const res = await fetch(
        `/api/payment/paymenku/status?trx_id=${encodeURIComponent(
          paymenkuData.transactionId
        )}`
      );
      if (res.ok) {
        const json = await res.json();
        const trx = json?.data;
        if (trx?.status === "paid" || trx?.status === "success") {
          setIsSuccess(true);
          setStatusMessage("Pembayaran berhasil diverifikasi oleh Paymenku!");
          if (pollingRef.current) clearInterval(pollingRef.current);
          setTimeout(async () => {
            await onConfirmSuccess();
          }, 1500);
          return;
        } else if (manual) {
          setStatusMessage("Pembayaran belum terdeteksi. Silakan selesaikan scan/transfer terlebih dahulu.");
          setTimeout(() => setStatusMessage(null), 4000);
        }
      }
    } catch (err: any) {
      console.warn("Status check warning:", err);
    } finally {
      if (manual) setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !paymenkuData?.transactionId || isSuccess) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    // Start auto polling
    pollingRef.current = setInterval(() => {
      checkStatus(false);
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, paymenkuData?.transactionId, isSuccess]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const handleCopyVa = () => {
    if (!paymenkuData?.vaNumber) return;
    navigator.clipboard.writeText(paymenkuData.vaNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualConfirm = async () => {
    setIsChecking(true);
    try {
      // First verify status with Paymenku
      if (paymenkuData?.transactionId) {
        const res = await fetch(
          `/api/payment/paymenku/status?trx_id=${encodeURIComponent(
            paymenkuData.transactionId
          )}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.status === "paid" || json?.data?.status === "success") {
            setIsSuccess(true);
            setTimeout(async () => {
              await onConfirmSuccess();
            }, 1000);
            return;
          }
        }
      }

      // If user confirms they paid
      await onConfirmSuccess();
    } catch (err: any) {
      console.error("Confirmation error:", err);
      alert(err?.message || "Gagal memverifikasi pembayaran.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  // QR image source: direct Paymenku QR URL, or QR server based on real EMVCo QR string
  const qrImageSrc =
    !imgError && paymenkuData?.qrisImageUrl
      ? paymenkuData.qrisImageUrl
      : paymenkuData?.qrisPayload
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          paymenkuData.qrisPayload
        )}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 bg-[var(--secondary)]/40">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Gerbang Pembayaran Paymenku
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Kanal Resmi QRIS Nasional & Virtual Account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Menghubungkan ke API Paymenku...
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Membuat barcode QRIS resmi dan nomor referensi transaksi
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Gagal Memproses ke Paymenku</span>
              </div>
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full rounded bg-red-600 text-white py-2 font-semibold text-xs hover:bg-red-700"
              >
                Tutup & Coba Lagi
              </button>
            </div>
          )}

          {/* Success State */}
          {!isLoading && isSuccess && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">
                Pembayaran Berhasil!
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] max-w-xs">
                Transaksi senilai <strong>{formatRupiah(amount)}</strong> telah terverifikasi oleh server Paymenku. Mengalihkan ke pesanan...
              </p>
            </div>
          )}

          {/* Normal Active Payment Screen */}
          {!isLoading && !errorMessage && !isSuccess && (
            <>
              {/* Amount & Countdown */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)]/20 p-4 text-center space-y-1.5">
                <span className="text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
                  Total Tagihan Pembayaran
                </span>
                <div className="text-3xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">
                  {formatRupiah(amount)}
                </div>
                <div className="flex items-center justify-center gap-3 pt-1 text-xs">
                  <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                    Ref: {paymenkuData?.orderNumber || orderNumber}
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* QRIS Channel Display */}
              {qrImageSrc ? (
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] space-y-3">
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="font-bold text-[var(--foreground)]">
                      QRIS Standar Nasional (ASPI & BI)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Live Paymenku
                    </span>
                  </div>

                  {/* Real QRIS Image */}
                  <div className="relative bg-white p-3 rounded-lg border border-gray-300 shadow-sm flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImageSrc}
                      alt="QRIS Paymenku Asli"
                      onError={() => setImgError(true)}
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <div className="text-center space-y-0.5">
                    <div className="text-xs font-semibold text-[var(--foreground)]">
                      Merchant: {paymenkuData?.merchantName || "Paymenku"}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      Trx ID: {paymenkuData?.transactionId || "-"}
                    </div>
                  </div>
                </div>
              ) : paymenkuData?.vaNumber ? (
                /* Virtual Account Display */
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      Nomor Virtual Account Paymenku
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                      Otomatis
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
                    <span className="text-base font-bold text-[var(--foreground)] font-mono tracking-wider">
                      {paymenkuData.vaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Transfer dapat dilakukan dari m-Banking atau ATM bank terkait.
                  </p>
                </div>
              ) : (
                /* If Amount < 10.000 for VA */
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p className="font-semibold">Informasi Saluran Pembayaran:</p>
                  <p>
                    Nominal transaksi Anda adalah Rp {amount.toLocaleString("id-ID")}. Kanal yang aktif dan didukung adalah QRIS.
                  </p>
                </div>
              )}

              {/* Status Indicator & Notification */}
              <div className="flex items-center justify-between rounded-lg bg-[var(--secondary)]/40 px-3.5 py-2.5 text-xs border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Menunggu pembayaran pengguna...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => checkStatus(true)}
                  disabled={isChecking}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
                  <span>Cek Status</span>
                </button>
              </div>

              {statusMessage && (
                <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {statusMessage}
                </div>
              )}

              {/* External Link Option to Paymenku Hosted Page */}
              {paymenkuData?.payUrl && (
                <a
                  href={paymenkuData.payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[var(--primary)] hover:underline border border-[var(--border)] rounded-lg bg-[var(--card)] transition-colors"
                >
                  <span>Buka di Halaman Pembayaran Paymenku</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {/* Instructions */}
              <div className="rounded-lg bg-[var(--secondary)]/30 p-3 text-[11px] text-[var(--muted-foreground)] space-y-1 border border-[var(--border)]">
                <div className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Instruksi Pembayaran:</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 pl-1">
                  <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
                  <li>Pilih menu <strong>Pindai / Scan QRIS</strong>.</li>
                  <li>Arahkan kamera ke kode QR di atas dan selesaikan transaksi sebesar <strong>{formatRupiah(amount)}</strong>.</li>
                  <li>Sistem akan mendeteksi mutasi secara otomatis tanpa perlu unggah bukti transfer.</li>
                </ol>
              </div>

              {/* Manual Confirmation Button */}
              <button
                type="button"
                disabled={isChecking}
                onClick={handleManualConfirm}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-3 text-xs font-bold text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-md transition-all active:scale-[0.98]"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Saya Sudah Membayar (Konfirmasi)</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export alias for backward compatibility
export const PaymenkuPaymentModal = PaymentSimulationModal;
