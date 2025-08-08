import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeckType } from "../../types/types";
import { useContext, useEffect } from "react";
import { request } from "../../utils/fetch-utils";
import { searchContext } from "../../context/SearchContext";
import { CustomError } from "../../utils/customError";

const getDecks = async (
  showSearchBar: boolean,
  queryClient: QueryClient,
  signal: AbortSignal
): Promise<DeckType[]> => {
  // If the search bar is open and the user opens the search results (e.g., any card) and reads it, and then closes it, if the user has opened the search bar on the home page, and when the user closes it by hitting the back button, they will be navigated to "/", which will trigger the execution of the useGetDecks() function. To avoid unnecessary network requests, I will serve the cached data in this case.
  // We will also check the following condition (cachedDecks === undefined) to ensure that the data is available in the cache. If it is not available, we will then proceed to refetch the data.
  const cachedDecks = queryClient.getQueryData<DeckType[] | undefined>([
    "decks",
  ]);

  if (!showSearchBar || cachedDecks === undefined) {
    try {
      const data = await request.get(`/decks`, signal);
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
        throw new CustomError(error?.message, error?.statusCode);
      } else {
        throw new CustomError("Something went wrong!", 503);
      }
    }
  }
  return cachedDecks;
};

export default function useGetDecks() {
  const { showSearchBar } = useContext(searchContext);
  const queryClient = useQueryClient();
  const url = `${import.meta.env.VITE_API_URL}/decks`;

  // Pre-populate query cache with browser cached data
  useEffect(() => {
    const loadAndSetCachedData = async () => {
      // Only load if there's no data in React Query cache
      const existingData = queryClient.getQueryData(["decks"]);
      if (existingData) return;

      try {
        const cache = await caches.open("decks-cache");
        const cachedResponse = await cache.match(url);

        if (cachedResponse) {
          const cachedData = await cachedResponse.json();
          // Pre-populate the React Query cache with success state
          queryClient.setQueryData(["decks"], cachedData);
        }
      } catch (error) {
        // Silently fail - cache loading is optional, don't break the app
      }
    };

    loadAndSetCachedData();
  }, []);

  return useQuery({
    queryKey: ["decks"],
    queryFn: ({ signal }) => getDecks(showSearchBar, queryClient, signal),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 0,
    gcTime: 10800000, // 3 hours
    networkMode: "offlineFirst",
    staleTime: 0, // Always refetch in background
  });
}
