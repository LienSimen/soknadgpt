import { configureQueryClient } from "wasp/client/operations";

export default async function mySetupFunction() {
  configureQueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 minutes - auth data is considered fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
        retry: (failureCount, error: any) => {
          // Don't retry auth failures to avoid console spam
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          // Only retry up to 2 times for other errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      },
    },
  });
}
