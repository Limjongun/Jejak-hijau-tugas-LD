import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import articlesData from "@/data/articles.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Ambil seluruh produk aktif dari SQLite
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });

    productEntries = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    console.warn("Gagal memuat produk untuk sitemap:", e);
  }

  // Halaman Statis & Pilar Edukasi
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sdgs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Artikel Edukasi Aksi Iklim dari articles.json
  const articleEntries: MetadataRoute.Sitemap = articlesData.map((art) => ({
    url: `${baseUrl}/learn/${art.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...productEntries, ...articleEntries];
}
