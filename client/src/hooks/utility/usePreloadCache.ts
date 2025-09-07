import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UsePreloadCacheOptions {
    queryKey: (string | number)[];
    cacheName: string;
    url: string;
}
// I am using useEffect to set the query instead of using placeholder data,
// because if the user starts dragging immediately, we will run into a problem
// when the drag ends. I rely on React Query data for all operations, and
// placeholder data is not stored in React Query cache.
// I can't use initialData either because it is synchronous cache loading is async
export function usePreloadCache<T>({ queryKey, cacheName, url }: UsePreloadCacheOptions) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const loadAndSetCachedData = async () => {
            const existingData = queryClient.getQueryData<T>(queryKey);
            if (existingData) return;

            try {
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(url);

                if (cachedResponse) {
                    const cachedData = await cachedResponse.json();
                    queryClient.setQueryData(queryKey, cachedData);
                }
            } catch {
                // Silently fail - cache loading is optional, don't break the app

            }
        };

        loadAndSetCachedData();
    }, [queryClient, queryKey, cacheName, url]);
}
