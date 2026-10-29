import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sdgs = await prisma.sdg.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(sdgs);
  } catch (error: any) {
    console.error("GET /api/sdgs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch SDGs" }, { status: 500 });
  }
}
