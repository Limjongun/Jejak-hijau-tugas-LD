import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCTS, CATEGORIES } from "@/data/initial-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        sdgs: {
          include: { sdg: true },
        },
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      stock: product.stock,
      weightGram: product.weightGram,
      status: product.status,
      isFeatured: product.isFeatured,
      co2SavedKg: product.co2SavedKg,
      plasticSavedPcs: product.plasticSavedPcs,
      impactNote: product.impactNote,
      origin: product.origin,
      materials: product.materials,
      avgRating: product.avgRating,
      soldCount: product.soldCount,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      images: product.images.map((img: any) => img.url),
      sdgIds: product.sdgs.map((s: any) => s.sdgId),
      reviews: product.reviews.map((r: any) => ({
        id: r.id,
        userName: r.user.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.warn("Prisma unavailable, falling back to static product:", error?.message);
  }

  // Graceful fallback for serverless edge
  const { id } = await params;
  const prod = PRODUCTS.find((p) => p.slug === id || p.id === id);
  if (prod) {
    const cat = CATEGORIES.find((c) => c.id === prod.categoryId);
    return NextResponse.json({
      ...prod,
      categoryName: cat?.name || "Katalog Hijau",
      categorySlug: cat?.slug || "all",
      reviews: [],
    });
  }

  return NextResponse.json({ error: "Product not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.co2SavedKg !== undefined) updateData.co2SavedKg = Number(body.co2SavedKg);
    if (body.plasticSavedPcs !== undefined) updateData.plasticSavedPcs = Number(body.plasticSavedPcs);
    if (body.impactNote !== undefined) updateData.impactNote = body.impactNote;
    if (body.origin !== undefined) updateData.origin = body.origin;
    if (body.materials !== undefined) updateData.materials = body.materials;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: true,
        sdgs: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productSdg.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product" }, { status: 500 });
  }
}
