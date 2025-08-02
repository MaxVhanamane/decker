import { request } from "../../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "../../utils/customError";
import type { GetCardsResponseType } from "../../types/types";

const getCards = async (
  deckId: string,
  signal: AbortSignal
): Promise<GetCardsResponseType | null> => {
  try {
    const data = await request.get(`/cards/${deckId}`, signal);
    return data?.data;
  } catch (error) {
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
