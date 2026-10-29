"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ArticleShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-2xs cursor-pointer"
      title="Salin tautan artikel ke papan klip"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Tautan Tersalin</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span>Bagikan Artikel</span>
        </>
      )}
    </button>
  );
}
