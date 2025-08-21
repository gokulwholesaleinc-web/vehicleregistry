import { ReactNode } from "react";
import { getAuthToken } from "../lib/auth";

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const hasToken = getAuthToken();
  
  if (!hasToken) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Redirect to sign in page
    window.location.href = "/signin";
    return null;
  }
  
  return <>{children}</>;
}