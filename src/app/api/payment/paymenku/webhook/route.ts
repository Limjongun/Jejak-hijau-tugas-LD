import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymenkuSignature } from "@/lib/paymenku";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_id,
      status,
      amount,
      signature,
      payment_method,
    } = body;

    if (!order_id) {
      return NextResponse.json({ error: "order_id wajib disertakan" }, { status: 400 });
    }

    // Optional signature verification if live credentials configured
    if (process.env.PAYMENKU_SECRET_KEY && signature) {
      const isValid = verifyPaymenkuSignature(signature, order_id, Number(amount));
      if (!isValid) {
        return NextResponse.json({ error: "Signature tidak valid" }, { status: 403 });
      }
    }

    // Find order in SQLite
    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (status === "PAID" || status === "SUCCESS" || status === "SETTLED") {
      // Update order to PAID
      await prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentStatus: "SUCCESS",
            paymentMethod: payment_method || "Paymenku QRIS",
            history: {
              create: {
                status: "PAID",
                note: `Pembayaran senilai Rp ${amount || order.total} terverifikasi via Paymenku Webhook (ID: ${transaction_id || "pmk-auto"})`,
                changedBy: "SYSTEM",
              },
            },
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook Paymenku berhasil diproses",
      orderNumber: order.orderNumber,
      status: "PAID",
    });
  } catch (error: any) {
    console.error("Paymenku Webhook error:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses webhook" }, { status: 500 });
  }
}
