import { QueryClient } from "@tanstack/react-query";
import { AlertData, DeckAndCardType } from "../types/types";
import { request } from "../utils/fetch-utils";
import { CustomError } from "../utils/customError";

type DeckTypeValue = DeckAndCardType[];
type ErrorResponse = {
  message: string;
  status: number;
};
const getDecksAndCards = async (
  setAlert: React.Dispatch<React.SetStateAction<AlertData>>
): Promise<DeckTypeValue> => {
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
  queryClient.prefetchQuery<DeckTypeValue | ErrorResponse>({
    queryKey: ["decks-and-cards"],
    queryFn: () => getDecksAndCards(setAlert),
    gcTime: 10800000, // 3 hours
  });
}
