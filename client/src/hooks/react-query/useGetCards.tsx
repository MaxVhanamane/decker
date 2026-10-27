import { request } from "../../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "../../utils/customError";
import type { GetCardsResponseType } from "../../types/types";
import { usePreloadCache } from "../utility/usePreloadCache";

const getCards = async (
  deckId: string,
  signal: AbortSignal,
  chapterId?: string,
): Promise<GetCardsResponseType | null> => {
  try {
    const url = chapterId
      ? `/api/v1/cards/${deckId}/${chapterId}`
      : `/api/v1/cards/${deckId}`;
    const data = await request.get(url, signal);
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

const useGetCards = (
  deckId: string,
  mode: "deck" | "chapter",
  chapterId?: string,
) => {
  let queryKey: string[] = [];
  let url: string | undefined;
  if (mode == "deck") {
    url = `${import.meta.env.VITE_API_URL}/api/v1/cards/${deckId}`;
    queryKey = ["cards", deckId];
  } else if (mode === "chapter" && chapterId) {
    url = `${import.meta.env.VITE_API_URL}/api/v1/cards/${deckId}/${chapterId}`;
    queryKey = ["chapter-cards", deckId, chapterId];
  }
  const cacheName = mode == "deck" ? "cards-cache" : "chapter-cards-cache";

  // Pre-populate query cache with browser cached data
  if (url) {
    usePreloadCache({ queryKey, cacheName, url });
  }

  return useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => {
      return getCards(deckId, signal, chapterId);
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errorMessage
    gcTime: 10800000, // 3
    networkMode: "offlineFirst",
  });
};

export default useGetCards;
