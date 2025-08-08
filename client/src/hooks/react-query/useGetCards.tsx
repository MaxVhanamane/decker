import { request } from "../../utils/fetch-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomError } from "../../utils/customError";
import type { GetCardsResponseType } from "../../types/types";
import { useEffect } from "react";

const getCards = async (
  deckId: string,
  signal: AbortSignal
): Promise<GetCardsResponseType | null> => {
  try {
    const data = await request.get(`/cards/${deckId}`, signal);
    return data?.data;
  } catch (error: any) {
    if (
      error?.name === "CanceledError" ||
      error?.name === "AbortError" ||
      error?.message?.includes("canceled") ||
      error?.message?.includes("aborted")
    ) {
      throw new Error("AbortError", error?.statusCode);
    }
    if (error instanceof CustomError) {
      // Now TypeScript recognizes 'error' as an instance of CustomError

      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useGetCards = (deckId: string) => {
  const queryKey = ["cards", deckId];
  const queryClient = useQueryClient();
  const url = `${import.meta.env.VITE_API_URL}/cards/${deckId}`;

  // Pre-populate query cache with browser cached data
  useEffect(() => {
    const loadAndSetCachedData = async () => {
      // Only load if there's no data in React Query cache
      const existingData = queryClient.getQueryData(["cards", deckId]);
      if (existingData) return;

      try {
        const cache = await caches.open("cards-cache");
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          // Pre-populate the React Query cache with success state
          queryClient.setQueryData(["cards", deckId], cachedData);
        }
      } catch (error) {
        // Silently fail - cache loading is optional, don't break the app
      }
    };

    loadAndSetCachedData();
  }, []);

  return useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => {
      return getCards(deckId, signal);
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errorMessage
    gcTime: 10800000, // 3
    networkMode: "offlineFirst",
  });
};

export default useGetCards;
