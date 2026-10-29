import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const sdgId = searchParams.get("sdg");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "featured";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const where: any = {
      status: "ACTIVE",
    };

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    if (sdgId) {
      const parsedSdg = parseInt(sdgId);
      if (!isNaN(parsedSdg)) {
        where.sdgs = {
          some: {
            sdgId: parsedSdg,
          },
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { impactNote: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "co2-high") {
      orderBy = { co2SavedKg: "desc" };
    } else if (sort === "popular") {
      orderBy = { soldCount: "desc" };
    } else if (sort === "featured") {
      orderBy = [{ isFeatured: "desc" }, { soldCount: "desc" }];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        sdgs: {
          include: { sdg: true },
        },
      },
    });

    // Format for easy frontend consumption
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      price: p.price,
      stock: p.stock,
      weightGram: p.weightGram,
      status: p.status,
      isFeatured: p.isFeatured,
      co2SavedKg: p.co2SavedKg,
      plasticSavedPcs: p.plasticSavedPcs,
      impactNote: p.impactNote,
      origin: p.origin,
      materials: p.materials,
      avgRating: p.avgRating,
      soldCount: p.soldCount,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      images: p.images.map((img) => img.url),
      sdgIds: p.sdgs.map((s) => s.sdgId),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      sku,
      description,
      price,
      stock,
      weightGram = 500,
      categoryId,
      co2SavedKg = 0,
      plasticSavedPcs = 0,
      impactNote,
      origin,
      materials,
      images = [],
      sdgIds = [],
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Nama, harga, dan kategori wajib diisi." }, { status: 400 });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const generatedSku = sku || "JH-" + Math.floor(1000 + Math.random() * 9000);

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        sku: generatedSku,
        description: description || name,
        price: Number(price),
        stock: Number(stock) || 10,
        weightGram: Number(weightGram) || 500,
        status: "ACTIVE",
        co2SavedKg: Number(co2SavedKg) || 0,
        plasticSavedPcs: Number(plasticSavedPcs) || 0,
        impactNote: impactNote || `Mengurangi emisi hingga ${co2SavedKg} kg CO₂ per tahun.`,
        origin: origin || "Indonesia",
        materials: materials || "Bahan Ramah Lingkungan",
        categoryId,
        images: {
          create: (images.length > 0 ? images : ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"]).map(
            (url: string, index: number) => ({
              url,
              order: index,
            })
          ),
        },
        sdgs: {
          create: (sdgIds.length > 0 ? sdgIds : [12, 13]).map((sdgId: number) => ({
            sdgId: Number(sdgId),
          })),
        },
      },
      include: {
        category: true,
        images: true,
        sdgs: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
