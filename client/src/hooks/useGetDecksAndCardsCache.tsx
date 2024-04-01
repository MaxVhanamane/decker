import { QueryClient } from "@tanstack/react-query";
import { AlertData, DeckAndCardType } from "../types/types";
import { request } from "../utils/fetch-utils";
import { CustomError } from "../utils/customError";

const getDecksAndCards = async (
  setAlert: React.Dispatch<React.SetStateAction<AlertData>>
): Promise<DeckAndCardType[]> => {
  try {
    const data = await request.get(`/decks-and-cards`);
    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      let message =
        "Unable to prefetch some data. You can continue using the app.";
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message,
        autoHideDuration: 7000,
      }));
    }

    return Promise.reject(error);
  }
};

export default function getDecksAndCardsCache({
  queryClient,
  setAlert,
}: {
  queryClient: QueryClient;
  setAlert: React.Dispatch<React.SetStateAction<AlertData>>;
}) {
  queryClient.prefetchQuery<DeckAndCardType[] | CustomError>({
    queryKey: ["decks-and-cards"],
    queryFn: () => getDecksAndCards(setAlert),
    gcTime: 10800000, // 3 hours
  });
}
