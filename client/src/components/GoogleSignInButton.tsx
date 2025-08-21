import { useEffect, useRef } from "react";
import { setAuthToken, api } from "../lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !divRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        try {
          const { token, user } = await api("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken: response.credential }),
          });
          setAuthToken(token);
          onSuccess?.();
        } catch (e) {
          console.error("Google sign-in error:", e);
          const errorMsg = e instanceof Error ? e.message : "Google sign-in failed";
          onError?.(errorMsg);
        }
      },
      auto_select: false,
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: "100%",
    });
  }, [onSuccess, onError]);

  return <div ref={divRef} className="w-full flex justify-center" />;
}