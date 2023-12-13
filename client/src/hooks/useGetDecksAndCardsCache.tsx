import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertData, DeckAndCardType } from "../types/types";
import { AlertContext } from "../context/AlertContext";
import { useContext, useEffect } from "react";
import { request } from "../utils/fetch-utils";

type DeckTypeValue = DeckAndCardType[];
type ErrorResponse = {
  message: string;
  status: number;
};
const getDecksAndCards = async (): Promise<DeckTypeValue | ErrorResponse> => {
  try {
    const data = await request.get(`/decks-and-cards`);
    if (data?.message) {
      return { message: data?.message, status: data?.status };
    } else {
      return data?.data;
    }
  } catch (error) {
    return {
      message:
        "An unexpected error occurred while fetching decks and cards. Please try again later.",
      status: 400,
    };
  }
};

export default function useGetDecksAndCardsCache() {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await queryClient.prefetchQuery<DeckTypeValue | ErrorResponse>({
          queryKey: ["decks-and-cards"],
          queryFn: getDecksAndCards,
        });

        // Optionally, you can modify the data here before caching it
        // For example: const modifiedData = modifyData(data);
        // queryClient.setQueryData("decks-and-cards", modifiedData);
      } catch (error) {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message:
            "An unexpected error occurred while fetching decks and cards. Please try again later.",
          autoHideDuration: 7000,
        }));
      }
    };

    fetchData();
  }, [queryClient]);

  return useQuery<DeckTypeValue | ErrorResponse>({
    queryKey: ["decks-and-cards"],
    queryFn: getDecksAndCards,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errors
  });
}
