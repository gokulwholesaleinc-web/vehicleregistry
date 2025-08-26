import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Hook for checking VIN availability in real-time
 * @param vin - The VIN to check (must be 17 characters)
 * @returns Query result with availability data
 */
export function useVinAvailability(vin?: string) {
  const normalizedVin = vin?.toUpperCase().replace(/\s+/g, '') || '';
  
  return useQuery({
    queryKey: ['vin-availability', normalizedVin],
    enabled: !!normalizedVin && normalizedVin.length === 17,
    queryFn: async () => {
      const result = await api(`/vin/availability?vin=${encodeURIComponent(normalizedVin)}`, {
        method: 'GET'
      });
      return result.data as { available: boolean; reason?: string };
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}