"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  redirectUrl?: string;
  buttonText?: string;
}

export function GoogleAuthButton({
  redirectUrl = "/account",
  buttonText = "Lanjutkan dengan Google",
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);

    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "305605426972-gm652e4bvoaud3k1mkujes5fsb1ho6um.apps.googleusercontent.com";

    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/google`);
    const scope = encodeURIComponent("openid email profile");
    const state = encodeURIComponent(`target_${redirectUrl}_${Date.now()}`);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=select_account`;

    // Arahkan browser langsung ke halaman login resmi Google
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex w-full h-11 items-center justify-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      <span>{buttonText}</span>
    </button>
  );
}
