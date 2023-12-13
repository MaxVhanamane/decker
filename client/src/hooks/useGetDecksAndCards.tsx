import { useQuery } from "@tanstack/react-query";
import { DeckAndCardType } from "../types/types";

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

export default function useGetDecksAndCards() {
  return useQuery({
    queryKey: ["decks-and-cards"],
    queryFn: getDecksAndCards,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Refetch on network reconnect
    refetchOnReconnect: true,

    // no retry on network errors
    retry: 0,
  });
}
