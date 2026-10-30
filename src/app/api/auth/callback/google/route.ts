import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Jika otorisasi dibatalkan atau terjadi error di sisi Google
  if (error || !code) {
    console.warn("Google OAuth error or cancelled:", error);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || "Akses Google dibatalkan")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback/google`;

  try {
    // 1. Tukar Authorization Code dengan Access Token Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Gagal menukar kode token Google:", errBody);
      return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Ambil Profil Pengguna dari Google UserInfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(`${origin}/login?error=fetch_userinfo_failed`);
    }

    const googleProfile = await userinfoResponse.json();
    const { email, name, picture } = googleProfile;

    if (!email) {
      return NextResponse.redirect(`${origin}/login?error=email_not_provided`);
    }

    let userEmail = email;
    let userName = name || email.split("@")[0];
    let userRole = "CUSTOMER";
    let userPoints = 100;

    // 3. Sinkronkan dengan Database jika database online
    try {
      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {
          name: name || undefined,
          image: picture || undefined,
          emailVerified: new Date(),
        },
        create: {
          email,
          name: name || email.split("@")[0],
          image: picture || null,
          emailVerified: new Date(),
          role: "CUSTOMER",
          ecoPoints: 100, // Bonus sambutan akun baru
        },
      });
      userEmail = dbUser.email;
      userName = dbUser.name;
      userRole = dbUser.role;
      userPoints = dbUser.ecoPoints;
    } catch (dbErr) {
      console.warn("Database offline during Google OAuth upsert, using Google UserInfo profile:", dbErr);
    }

    // 4. Sukses: Redirect ke halaman Akun Pelanggan dengan parameter sesi asli
    const response = NextResponse.redirect(
      `${origin}/account?sso=google&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}&role=${userRole}&points=${userPoints}`
    );
    
    // Set cookie sesi aman
    response.cookies.set("jh_session_email", userEmail, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth Callback Handler Exception:", err);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message || "Internal OAuth Error")}`);
  }
}
