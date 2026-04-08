// packages/logger/api-client.ts
import { useQuery } from '@tanstack/react-query';

export const useFetchData = (key: string, fn: () => Promise<any>) => {
  return useQuery({
    queryKey: [key],
    queryFn: fn,
    retry: 3, // Otomatis coba lagi 3x jika gagal (Requirement #3)
    onError: (err:any) => console.error("API Error handled:", err),
  });
};