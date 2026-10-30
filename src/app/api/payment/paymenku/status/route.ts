import { NextRequest, NextResponse } from "next/server";
import { checkPaymenkuTransactionStatus } from "@/lib/paymenku";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trxId = searchParams.get("trx_id") || searchParams.get("reference_id");

    if (!trxId) {
      return NextResponse.json(
        { error: "trx_id atau reference_id diperlukan" },
        { status: 400 }
      );
    }

    const data = await checkPaymenkuTransactionStatus(trxId);

    // If paid, update in database if order exists
    if (data.status === "paid" || data.status === "success") {
      try {
        const refId = data.reference_id;
        if (refId) {
          const order = await prisma.order.findUnique({
            where: { orderNumber: refId },
          });
          if (order && order.status !== "PAID") {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: "PAID",
                paymentStatus: "SUCCESS",
              },
            });
          }
        }
      } catch (dbErr) {
        // Non-blocking if Prisma/D1 is in fallback mode
      }
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error checking Paymenku status:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memeriksa status pembayaran" },
      { status: 500 }
    );
  }
}
