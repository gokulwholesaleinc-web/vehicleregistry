import { useQuery } from "@tanstack/react-query";
import { getAuthToken, api } from "@/lib/auth";

export function useAuth() {
  const token = getAuthToken();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/v1/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      try {
        const result = await api("/api/v1/auth/user");
        console.log("Auth query result:", result);
        // Handle standardized response format { ok: true, data: user }
        return result.data || result;
      } catch (err) {
        console.log("Auth query error:", err);
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

  const isAuthenticated = !!user && !!token;
  const authLoading = !!token && isLoading;
  
  console.log("useAuth state:", { 
    token: token ? "present" : "missing", 
    user: user ? "present" : "missing", 
    isLoading: authLoading, 
    isAuthenticated,
    error 
  });

  return {
    user,
    isLoading: authLoading,
    isAuthenticated,
    error,
  };
}