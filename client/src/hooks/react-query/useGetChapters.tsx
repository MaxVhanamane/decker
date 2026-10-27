import { request } from "../../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "../../utils/customError";
import type { GetChaptersResponseType } from "../../types/types";
import { usePreloadCache } from "../utility/usePreloadCache";

const getChapters = async (
  deckId: string,
  signal: AbortSignal,
): Promise<GetChaptersResponseType | null> => {
  try {
    const data = await request.get(`/api/v1/chapters/${deckId}`, signal);
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

const useGetChapters = (deckId: string) => {
  const queryKey = ["chapters", deckId];
  const url = `${import.meta.env.VITE_API_URL}/api/v1/chapters/${deckId}`;

  // Pre-populate query cache with browser cached data
  usePreloadCache({
    queryKey: ["chapters", deckId],
    cacheName: "chapters-cache",
    url,
  });

  return useQuery({
    queryKey: queryKey,
    queryFn: ({ signal }) => {
      return getChapters(deckId, signal);
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errorMessage
    gcTime: 10800000, // 3
    networkMode: "offlineFirst",
  });
};

export default useGetChapters;
