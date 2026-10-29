import React from "react";
import { Leaf } from "lucide-react";

interface EcoImpactBadgeProps {
  co2SavedKg?: number;
  plasticSavedPcs?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EcoImpactBadge({
  co2SavedKg = 0,
  plasticSavedPcs = 0,
  className = "",
  size = "md",
}: EcoImpactBadgeProps) {
  const hasCo2 = co2SavedKg > 0;
  const hasPlastic = plasticSavedPcs > 0;

  if (!hasCo2 && !hasPlastic) return null;

  const sizeClasses = {
    sm: "text-[11px] py-0.5 px-2 gap-1.5",
    md: "text-xs py-1 px-2.5 gap-2",
    lg: "text-xs font-medium py-1.5 px-3 gap-2",
  };

  return (
    <div
      title="Estimasi penghematan dampak per tahun dibanding produk konvensional"
      className={`inline-flex items-center rounded-md border transition-colors
      bg-[var(--eco-stamp-bg)] text-[var(--eco-stamp-text)] border-[var(--eco-stamp-border)]
      ${sizeClasses[size]} ${className}`}
    >
      <Leaf className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={1.75} />

      <div className="flex items-center gap-1.5 font-medium tabular-nums">
        {hasCo2 && (
          <span>
            <strong className="font-semibold">-{co2SavedKg}</strong> kg CO₂/thn
          </span>
        )}

        {hasCo2 && hasPlastic && (
          <span className="opacity-40 font-normal">|</span>
        )}

        {hasPlastic && (
          <span>
            <strong className="font-semibold">-{plasticSavedPcs}</strong> plastik
          </span>
        )}
      </div>
    </div>
  );
}
