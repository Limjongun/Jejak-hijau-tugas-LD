import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymenkuWebhookSignature, getPaymenkuConfig } from "@/lib/paymenku";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const signature = request.headers.get("x-paymenku-signature") || "";
    const timestamp = request.headers.get("x-paymenku-timestamp") || "";
    const cfg = getPaymenkuConfig();

    // Verify signature if secret key is configured and headers are present
    if (cfg.secretKey && signature && timestamp) {
      const isValid = verifyPaymenkuWebhookSignature(
        signature,
        timestamp,
        rawBody,
        cfg.secretKey
      );
      if (!isValid) {
        console.warn("Paymenku Webhook: Invalid signature rejected");
        return NextResponse.json({ error: "Signature tidak valid" }, { status: 401 });
      }
    }

    // Paymenku payload structure
    const referenceId = body.reference_id || body.order_id;
    const trxId = body.trx_id || body.transaction_id;
    const status = (body.status || "").toLowerCase();
    const amount = body.amount;
    const paymentChannel = body.payment_channel || body.payment_method || "QRIS";

    if (!referenceId) {
      return NextResponse.json(
        { error: "reference_id / order_id wajib disertakan" },
        { status: 400 }
      );
    }

    // Check order in database
    const order = await prisma.order.findUnique({
      where: { orderNumber: referenceId },
      include: { user: true },
    });

    if (order && (status === "paid" || status === "success" || status === "settled")) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentStatus: "SUCCESS",
            paymentMethod: `Paymenku (${paymentChannel})`,
          },
        });
      } catch (dbErr) {
        console.warn("DB update warning in webhook:", dbErr);
      }
    }

    // Always respond 200 OK immediately as required by Paymenku
    return NextResponse.json({
      success: true,
      message: "Webhook Paymenku diproses",
      reference_id: referenceId,
      trx_id: trxId,
      status: status,
    });
  } catch (error: any) {
    console.error("Paymenku Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses webhook" },
      { status: 500 }
    );
  }
}
