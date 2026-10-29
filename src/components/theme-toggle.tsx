"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle tema"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] ${className}`}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ring)] ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[var(--foreground)]" strokeWidth={1.5} />
      ) : (
        <Moon className="h-4 w-4 text-[var(--foreground)]" strokeWidth={1.5} />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
