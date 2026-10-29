"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Leaf,
  Menu,
  X,
  User,
  Search,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const totalItems = getTotalItems();

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Katalog" },
    { href: "/account/impact", label: "Dampak Saya" },
    { href: "/learn", label: "Edukasi Iklim" },
    { href: "/sdgs", label: "SDGs" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--card)] transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo: Clean, Editorial */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Leaf className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none">
              JejakHijau
            </span>
            <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--muted-foreground)] mt-0.5">
              Katalog Berkelanjutan
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links: Left-to-center clean editorial */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--secondary)] text-[var(--primary)] font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Search Shortcut */}
          <Link
            href="/products"
            aria-label="Cari produk"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </Link>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Cart Drawer Trigger */}
          <button
            onClick={toggleCart}
            aria-label="Buka keranjang belanja"
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white tabular-nums">
                {totalItems}
              </span>
            )}
          </button>

          {/* Account / Login */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
              >
                <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <User className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Masuk</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--foreground)]"
            aria-label="Buka menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center">
            {isAuthenticated && user ? (
              <div className="flex w-full items-center justify-between">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]"
                >
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  <span>{user.name}</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] font-bold text-[var(--accent)] hover:underline"
                  >
                    Portal Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]"
              >
                <User className="h-4 w-4" strokeWidth={1.75} />
                <span>Masuk ke Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
