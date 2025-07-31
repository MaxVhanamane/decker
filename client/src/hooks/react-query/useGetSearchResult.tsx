import { request } from "../../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "../../utils/customError";
import type { SearchResponse } from "../../types/types";

type Params = {
  query: string;
  page: number;
  limit: number;
};

export const getSearchResult = async (
  { limit, page, query }: Params,
  signal: AbortSignal
): Promise<SearchResponse | null> => {
  try {
    const data = await request.get(
      `/search/?q=${query}&page=${page}&limit=${limit}`,
      signal
    );
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

const useGetSearchResult = ({ limit, page, query }: Params) => {
  return useQuery({
    queryKey: ["searchResult", query, page],
    queryFn: ({ signal }) => {
      return getSearchResult({ query, page, limit }, signal);
    },
    enabled: false,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 0, // no retry on network errorMessage
    gcTime: 5 * 60 * 1000,
  });
};

export default useGetSearchResult;
