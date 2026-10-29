import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (email) {
      where.user = { email };
    } else if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: true,
      },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customerName || o.user?.name || "Pelanggan",
      customerEmail: o.customerEmail || o.user?.email,
      total: o.total,
      subtotal: o.subtotal,
      shippingCost: o.shippingCost,
      status: o.status,
      date: o.createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      courier: o.courier,
      plasticFree: o.plasticFreePack,
      isGreenDelivery: o.isGreenDelivery,
      co2Saved: o.totalCo2Kg,
      plasticSaved: o.totalPlastic,
      trackingNumber: o.trackingNumber || "",
      itemCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.productName,
        image: it.productImage,
        price: it.price,
        quantity: it.quantity,
        co2SavedKg: it.co2SavedKg,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail = "user@jejakhijau.id",
      customerPhone,
      shippingAddress,
      courier = "Motor Listrik EV (Green Delivery)",
      courierService = "Instant EV",
      isGreenDelivery = true,
      plasticFreePack = true,
      pointsUsed = 0,
      destLatitude = -6.8905,
      destLongitude = 107.6162,
      deliveryDistanceKm = 4.2,
      items = [],
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja kosong." }, { status: 400 });
    }

    // 1. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName || "Pelanggan JejakHijau",
          phone: customerPhone,
          role: "CUSTOMER",
          ecoPoints: 100,
        },
      });
    }

    // 2. Fetch live products to verify prices & stock
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { take: 1 } },
    });

    let subtotal = 0;
    let totalCo2 = 0;
    let totalPlastic = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Produk ID ${item.productId} tidak ditemukan.` }, { status: 404 });
      }

      if (prod.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok produk "${prod.name}" tersisa ${prod.stock} unit, tidak mencukupi permintaan.` },
          { status: 400 }
        );
      }

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;
      totalCo2 += prod.co2SavedKg * item.quantity;
      totalPlastic += prod.plasticSavedPcs * item.quantity;

      orderItemsData.push({
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0]?.url || "",
        price: prod.price,
        quantity: item.quantity,
        co2SavedKg: prod.co2SavedKg,
        plasticSavedPcs: prod.plasticSavedPcs,
      });
    }

    const shippingCost = isGreenDelivery ? 10000 : 15000;
    const discount = Math.min(subtotal * 0.3, Math.floor(pointsUsed / 100) * 1000);
    const total = Math.max(0, subtotal + shippingCost - discount);

    // Points calculation: 1 point per 1000 subtotal + 10 points bonus if plastic-free
    const pointsEarned = Math.floor(subtotal / 1000) + (plasticFreePack ? 10 : 0);

    // Generate Order Number: JH-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JH-${dateStr}-${randomHex}`;

    // Execute atomic transaction in SQLite
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Deduct stock and increment soldCount
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: "PAID",
          subtotal,
          shippingCost,
          discount,
          pointsUsed,
          pointsEarned,
          total,
          courier,
          courierService,
          isGreenDelivery,
          plasticFreePack,
          customerName: customerName || user.name,
          customerEmail: customerEmail || user.email,
          customerPhone: customerPhone || user.phone,
          shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
          destLatitude: Number(destLatitude) || -6.8905,
          destLongitude: Number(destLongitude) || 107.6162,
          deliveryDistanceKm: Number(deliveryDistanceKm) || 4.2,
          totalCo2Kg: Number(totalCo2.toFixed(2)),
          totalPlastic,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Update user points and accumulated metrics
      const pointsDiff = pointsEarned - pointsUsed;
      await tx.user.update({
        where: { id: user.id },
        data: {
          ecoPoints: { increment: pointsDiff },
          totalCo2Kg: { increment: totalCo2 },
          totalPlastic: { increment: totalPlastic },
        },
      });

      // Log point transaction
      if (pointsEarned > 0) {
        await tx.ecoPointTransaction.create({
          data: {
            userId: user.id,
            type: "EARN",
            amount: pointsEarned,
            refId: newOrder.id,
            note: `Perolehan belanja pesanan ${orderNumber}`,
          },
        });
      }

      if (pointsUsed > 0) {
        await tx.ecoPointTransaction.create({
          data: {
            userId: user.id,
            type: "REDEEM_DISCOUNT",
            amount: -pointsUsed,
            refId: newOrder.id,
            note: `Tukar diskon pada pesanan ${orderNumber}`,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
  }
}
