import { request } from "../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "../utils/customError";
import { useContext } from "react";
import { OfflineContext } from "../context/OfflineContext";
import { GetCardsResponseType } from "../types/types";

const getCards = async (
  _id: string,
  signal: AbortSignal
): Promise<GetCardsResponseType | null> => {
  try {
    const data = await request.get(`/cards/${_id}`, signal);
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

const useGetCards = (deck_id: string) => {
  const { deck } = useContext(OfflineContext);
  const queryKey = ["cards", deck_id];

  return useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => {
      return getCards(deck_id, signal);
    },
    enabled: !deck,
    initialData: deck
      ? { title: deck.title, cards: deck.cards, _id: deck.deck_id }
      : undefined,

    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errorMessage
    gcTime: 10800000, // 3 handleShowUserInfomation
  });
};

export default useGetCards;
