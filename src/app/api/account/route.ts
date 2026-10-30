import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(pass: string): string {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Parameter email wajib disertakan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        donations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Tolak jika akun tidak ada di database (tidak ada auto-create)
    if (!user) {
      return NextResponse.json(
        { error: "Akun dengan email ini belum terdaftar. Silakan registrasi terlebih dahulu." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "+62 812-3456-7890",
      role: user.role,
      points: user.ecoPoints,
      totalCo2Kg: user.totalCo2Kg,
      totalPlastic: user.totalPlastic,
      hasPassword: !!user.passwordHash,
      isGoogleAuth: !!user.emailVerified && !user.passwordHash,
      memberSince: user.createdAt.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
      ordersCount: user.orders.length,
      donatedTreesCount:
        user.donations.filter((d: any) => d.status === "PLANTED").length + user.donations.length,
    });
  } catch (error: any) {
    console.error("GET /api/account error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch account" }, { status: 500 });
  }
}

// Endpoint Registrasi Akun Baru Manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Nama dan alamat email wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Alamat email ini sudah terdaftar. Silakan langsung masuk." },
        { status: 409 }
      );
    }

    // 2. Buat akun baru di database SQLite lokal
    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: password ? hashPassword(password) : null,
        phone: phone || "+62 812-3456-7890",
        role: cleanEmail.includes("admin") ? "ADMIN" : "CUSTOMER",
        ecoPoints: 100, // Bonus registrasi akun baru
        totalCo2Kg: 0,
        totalPlastic: 0,
      },
    });

    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        points: newUser.ecoPoints,
        totalCo2Kg: newUser.totalCo2Kg,
        totalPlastic: newUser.totalPlastic,
        memberSince: newUser.createdAt.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        }),
        ordersCount: 0,
        donatedTreesCount: 0,
        message: "Pendaftaran berhasil! Akun Anda aktif dengan bonus 100 Eco Points.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/account error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses pendaftaran akun." },
      { status: 500 }
    );
  }
}
