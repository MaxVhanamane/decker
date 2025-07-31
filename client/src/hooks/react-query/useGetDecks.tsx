import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeckType } from "../../types/types";
import { useContext } from "react";
import { request } from "../../utils/fetch-utils";
import { searchContext } from "../../context/SearchContext";
import { CustomError } from "../../utils/customError";

const getDecks = async (
  showSearchBar: boolean,
  queryClient: QueryClient // Update the type of queryClient
): Promise<DeckType[]> => {
  // If the search bar is open and the user opens the search results (e.g., any card) and reads it, and then closes it, if the user has opened the search bar on the home page, and when the user closes it by hitting the back button, they will be navigated to "/", which will trigger the execution of the useGetDecks() function. To avoid unnecessary network requests, I will serve the cached data in this case.
  // We will also check the following condition (cachedDecks === undefined) to ensure that the data is available in the cache. If it is not available, we will then proceed to refetch the data.
  const cachedDecks = queryClient.getQueryData<DeckType[] | undefined>([
    "decks",
  ]);
  if (!showSearchBar || cachedDecks === undefined) {
    try {
      const data = await request.get(`/decks`);
      return data?.data;
    } catch (error) {
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
  return useQuery({
    queryKey: ["decks"],

    queryFn: () => {
      return getDecks(showSearchBar, queryClient); // Pass the queryClient as a parameter
    },

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Refetch on network reconnect
    refetchOnReconnect: true,

    // no retry on network errors
    retry: 0,
    gcTime: 10800000, // 3 hours
  });
}
