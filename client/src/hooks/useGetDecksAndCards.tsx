import { useQuery } from "@tanstack/react-query";
import { DeckAndCardType } from "../types/types";

import { request } from "../utils/fetch-utils";
import { CustomError } from "../utils/customError";

export const getDecksAndCards = async (): Promise<
  DeckAndCardType[] | CustomError
> => {
  try {
    const data = await request.get(`/decks-and-cards`);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
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
    gcTime: 10800000, // 3 hours
    // staleTime: 9000000, //2.5 hours
  });
}
