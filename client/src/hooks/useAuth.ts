import { useQuery } from "@tanstack/react-query";
import { getAuthToken, api } from "@/lib/auth";

export function useAuth() {
  const token = getAuthToken();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      try {
        return await api("/api/auth/user");
      } catch (err) {
        // Token might be expired, remove it
        if (err instanceof Error && err.message.includes("401")) {
          localStorage.removeItem("vg.jwt");
        }
        return null;
      }
    },
    retry: false,
    enabled: !!token,
  });

  return {
    user,
    isLoading: !!token && isLoading,
    isAuthenticated: !!user && !!token,
    error,
  };
}