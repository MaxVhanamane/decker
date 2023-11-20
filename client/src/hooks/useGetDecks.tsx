import { QueryClient, useQuery, useQueryClient } from "react-query";
import { AlertData, AxiosErrorType, DeckType } from "../types/types";
import { useContext } from "react";
import { request } from "../utils/axios-utils";
import { AlertContext } from "../context/AlertContext";
import { searchContext } from "../context/SearchContext";

type DeckTypeValue = DeckType[] & { message?: string };

const getDecks = async (
  showSearchBar: boolean,
  queryClient: QueryClient // Update the type of queryClient
): Promise<DeckTypeValue | undefined> => {
  // If the search bar is open and the user opens the search results (e.g., any card) and reads it, and then closes it, if the user has opened the search bar on the home page, and when the user closes it by hitting the back button, they will be navigated to "/", which will trigger the execution of the useGetDecks() function. To avoid unnecessary network requests, I will serve the cached data in this case.
  // We will also check the following condition (cachedDecks === undefined) to ensure that the data is available in the cache. If it is not available, we will then proceed to refetch the data.
  const cachedDecks = queryClient.getQueryData<DeckTypeValue | undefined>(
    "decks"
  );
  if (!showSearchBar || cachedDecks === undefined) {
    try {
      const decks = await request.get(`/decks`);
      return decks.data;
    } catch (error) {
      // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
      if ((error as AxiosErrorType)?.response?.status === 500) {
        throw new Error("Internal server error");
      } else if ((error as Error).message === "Network Error") {
        throw new Error("Network Error");
      }
      throw error;
    }
  }
  return cachedDecks;
};

export default function useGetDecks() {
  const { setAlert } = useContext(AlertContext);
  const { showSearchBar } = useContext(searchContext);
  const queryClient = useQueryClient(); // Remove the type argument <unknown>
  return useQuery(
    "decks",
    () => {
      return getDecks(showSearchBar, queryClient); // Pass the queryClient as a parameter
    },
    {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 0, // no retry on network errors
      onError: (error) => {
        const message =
          (error as Error).message === "Network Error"
            ? "No internet connection"
            : (error as Error).message;
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: (error as AxiosErrorType)?.response?.data.message || message,
          autoHideDuration: 7000,
        }));
      },
    }
  );
}
