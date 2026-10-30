import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, PRODUCTS } from "@/data/initial-data";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (categories && categories.length > 0) {
      return NextResponse.json(categories);
    }
  } catch (error: any) {
    console.warn("Prisma unavailable, falling back to static CATEGORIES:", error?.message);
  }

  // Graceful fallback when running in serverless edge without local SQLite
  const fallback = CATEGORIES.map((cat) => ({
    ...cat,
    _count: {
      products: PRODUCTS.filter((p) => p.categoryId === cat.id).length,
    },
  }));

  return NextResponse.json(fallback);
}
