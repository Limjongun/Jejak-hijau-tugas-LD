"use client";

import React from "react";
import { TreePine, Wind, ShieldCheck, Trash2 } from "lucide-react";
import { EcoImpactCalculation } from "@/types";

interface CarbonCalculatorCardProps {
  impact: EcoImpactCalculation;
  points?: number;
  className?: string;
  variant?: "compact" | "full";
}

export function CarbonCalculatorCard({
  impact,
  points = 0,
  className = "",
  variant = "full",
}: CarbonCalculatorCardProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 ${className}`}
    >
      {/* Header bergaya label spesifikasi kemasan */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Metrik Verifikasi
          </span>
          <h4 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
            Estimasi Dampak Lingkungan
          </h4>
        </div>

        {points > 0 && (
          <span className="rounded-sm bg-[var(--secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)] tabular-nums border border-[var(--border)]">
            +{points} Poin Eco
          </span>
        )}
      </div>

      {/* Grid Data Konkret */}
      <div
        className={`mt-4 grid gap-3 ${
          isCompact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        {/* CO2 Saved */}
        <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Wind className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.75} />
            <span>CO₂ Berkurang</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-[var(--foreground)] tabular-nums">
            {impact.co2Kg.toLocaleString("id-ID")}{" "}
            <span className="text-xs font-normal text-[var(--muted-foreground)]">
              kg
            </span>
          </div>
        </div>

        {/* Plastic Avoided */}
        <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Trash2 className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
            <span>Sampah Plastik</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-[var(--foreground)] tabular-nums">
            -{impact.plasticPcs}{" "}
            <span className="text-xs font-normal text-[var(--muted-foreground)]">
              pcs
            </span>
          </div>
        </div>

        {/* Tree Equivalent */}
        <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <TreePine className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.75} />
            <span>Setara Serapan</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-[var(--foreground)] tabular-nums">
            {impact.treeEquivalent}{" "}
            <span className="text-xs font-normal text-[var(--muted-foreground)]">
              pohon
            </span>
          </div>
        </div>

        {/* Motor Travel Offset */}
        <div className="rounded-md border border-[var(--border)] bg-[var(--secondary)]/50 p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={1.75} />
            <span>Jarak Emisi Motor</span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-[var(--foreground)] tabular-nums">
            {impact.motorKmEquivalent}{" "}
            <span className="text-xs font-normal text-[var(--muted-foreground)]">
              km
            </span>
          </div>
        </div>
      </div>

      {/* Catatan Kaki Jujur */}
      <p className="mt-3 text-[11px] text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] pt-2.5">
        Catatan: Angka di atas dihitung berdasarkan perbandingan siklus hidup produk ramah lingkungan terhadap produk sekali pakai atau berbahan bakar fosil.
      </p>
    </div>
  );
}
