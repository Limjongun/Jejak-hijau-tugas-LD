import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "JejakHijau | Belanja Berkelanjutan & Reduksi Jejak Karbon",
  description:
    "Platform e-commerce berkelanjutan untuk produk ramah lingkungan. Dapatkan estimasi dampak CO₂, kumpulkan Eco Points, dan berdonasi pohon untuk aksi iklim nyata (SDGs 13, 12, 7, 15).",
  keywords: [
    "JejakHijau",
    "eco-commerce",
    "produk ramah lingkungan",
    "zero waste",
    "energi bersih",
    "jejak karbon",
    "SDGs",
    "donasi pohon",
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-dev-console",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
