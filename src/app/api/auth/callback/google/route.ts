import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Pastikan baseUrl selalu HTTPS di production
  let baseUrl = origin && origin !== "null" ? origin : "https://jejakhijau.web.id";
  if (baseUrl.includes("jejakhijau.web.id")) {
    baseUrl = "https://jejakhijau.web.id";
  }

  // Jika otorisasi dibatalkan atau terjadi error di sisi Google
  if (error || !code) {
    console.warn("Google OAuth error or cancelled:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error || "Akses Google dibatalkan")}`);
  }

  // Dapatkan kredensial dari Cloudflare context (env & secrets) atau process.env
  let clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "305605426972-gm652e4bvoaud3k1mkujes5fsb1ho6um.apps.googleusercontent.com";
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  try {
    const cfContext = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfContext?.env) {
      if (cfContext.env.GOOGLE_CLIENT_ID) {
        clientId = cfContext.env.GOOGLE_CLIENT_ID;
      }
      if (cfContext.env.GOOGLE_CLIENT_SECRET) {
        clientSecret = cfContext.env.GOOGLE_CLIENT_SECRET;
      }
    }
  } catch (cfErr) {
    console.warn("Cloudflare context lookup error:", cfErr);
  }

  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  try {
    // 1. Tukar Authorization Code dengan Access Token Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Gagal menukar kode token Google:", errBody);
      return NextResponse.redirect(
        `${baseUrl}/login?error=token_exchange_failed&details=${encodeURIComponent(errBody.slice(0, 120))}`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Ambil Profil Pengguna dari Google UserInfo API
    const userinfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=fetch_userinfo_failed`);
    }

    const googleProfile = await userinfoResponse.json();
    const { email, name } = googleProfile;

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_not_provided`);
    }

    const userEmail = email;
    const userName = name || email.split("@")[0];
    const userRole = "CUSTOMER";
    const userPoints = 100;

    // 3. Sukses: Redirect ke halaman Akun Pelanggan dengan parameter sesi profil asli Google
    const response = NextResponse.redirect(
      `${baseUrl}/account?sso=google&email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}&role=${userRole}&points=${userPoints}`
    );

    // Set cookie sesi
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
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(err.message || "Internal OAuth Error")}`);
  }
}
