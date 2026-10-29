import React from "react";
import { SDGS } from "@/data/initial-data";

interface SdgBadgeProps {
  sdgId: number;
  showName?: boolean;
  className?: string;
}

export function SdgBadge({ sdgId, showName = false, className = "" }: SdgBadgeProps) {
  const sdg = SDGS.find((s) => s.id === sdgId);
  if (!sdg) return null;

  return (
    <span
      title={`SDG ${sdg.id}: ${sdg.name}`}
      className={`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${className}`}
      style={{
        backgroundColor: `${sdg.color}18`,
        borderColor: `${sdg.color}45`,
        color: sdg.color,
      }}
    >
      <span className="font-bold">SDG {sdg.id}</span>
      {showName && (
        <span className="font-normal opacity-90 truncate max-w-[130px] normal-case">
          — {sdg.name}
        </span>
      )}
    </span>
  );
}
