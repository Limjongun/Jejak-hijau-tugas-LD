import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: true,
        history: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, note, changedBy = "ADMIN" } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        history: status
          ? {
              create: {
                status,
                note: note || `Status diubah menjadi ${status}`,
                changedBy,
              },
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 });
  }
}
