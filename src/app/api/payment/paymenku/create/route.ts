import { NextRequest, NextResponse } from "next/server";
import { createPaymenkuTransaction } from "@/lib/paymenku";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
    } = body;

    if (!orderNumber || !amount) {
      return NextResponse.json(
        { error: "orderNumber dan amount wajib diisi" },
        { status: 400 }
      );
    }

    const result = await createPaymenkuTransaction({
      orderNumber,
      amount: Number(amount),
      customerName: customerName || "Pelanggan JejakHijau",
      customerEmail: customerEmail || "pelanggan@jejakhijau.id",
      customerPhone: customerPhone || "081234567890",
      paymentMethod: paymentMethod || "qris",
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating Paymenku transaction:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal membuat transaksi Paymenku" },
      { status: 500 }
    );
  }
}
