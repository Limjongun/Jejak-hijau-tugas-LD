import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const where: any = {};
    if (email) {
      where.user = { email };
    }

    const trees = await prisma.treeDonation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const formatted = trees.map((t) => ({
      id: t.id,
      user: t.user?.name || "Konsumen Hijau",
      userEmail: t.user?.email,
      type: t.treeType,
      quantity: t.quantity,
      status: t.status,
      location: t.location || "Kawasan Konservasi Hutan Mitra",
      gpsCoordinates: t.gpsCoordinates || "",
      proofImage: t.proofImage || "",
      requestedAt: t.createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      plantedAt: t.plantedAt
        ? t.plantedAt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/trees error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tree donations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail = "user@jejakhijau.id",
      treeType = "Trembesi",
      quantity = 1,
      location = "Tahura Juanda, Bandung",
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const requiredPoints = 500 * quantity;
    if (user.ecoPoints < requiredPoints) {
      return NextResponse.json(
        { error: `Saldo Eco Points tidak mencukupi. Diperlukan ${requiredPoints} poin, saldo Anda ${user.ecoPoints} poin.` },
        { status: 400 }
      );
    }

    const donation = await prisma.$transaction(async (tx) => {
      // Deduct points
      await tx.user.update({
        where: { id: user.id },
        data: {
          ecoPoints: { decrement: requiredPoints },
        },
      });

      // Create tree donation
      const newTree = await tx.treeDonation.create({
        data: {
          userId: user.id,
          treeType,
          quantity,
          source: "POINTS",
          status: "PENDING",
          location,
          gpsCoordinates: "-6.8524, 107.6321",
        },
      });

      // Log points transaction
      await tx.ecoPointTransaction.create({
        data: {
          userId: user.id,
          type: "REDEEM_TREE",
          amount: -requiredPoints,
          refId: newTree.id,
          note: `Adopsi ${quantity} bibit pohon ${treeType}`,
        },
      });

      return newTree;
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/trees error:", error);
    return NextResponse.json({ error: error.message || "Failed to redeem tree" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status = "PLANTED", location, proofImage } = body;

    if (!id) {
      return NextResponse.json({ error: "ID donasi pohon wajib disertakan." }, { status: 400 });
    }

    const updated = await prisma.treeDonation.update({
      where: { id },
      data: {
        status,
        location: location || undefined,
        proofImage: proofImage || undefined,
        plantedAt: status === "PLANTED" ? new Date() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/trees error:", error);
    return NextResponse.json({ error: error.message || "Failed to update tree status" }, { status: 500 });
  }
}
