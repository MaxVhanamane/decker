import { useQuery } from "react-query";
import { AlertData, AxiosErrorType, DeckAndCardType } from "../types/types";
import { AlertContext } from "../context/AlertContext";
import { useContext } from "react";
import { request } from "../utils/axios-utils";

type DeckTypeValue = DeckAndCardType[] & { message?: string };

const getDecksAndCards = async (): Promise<DeckTypeValue> => {
  try {
    const decks = await request.get(`/decks-and-cards`);
    return decks.data;
  } catch (error) {
    // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
    if ((error as AxiosErrorType)?.response?.status === 500) {
      throw new Error("Internal server error");
    } else if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

export default function useGetDecksAndCards() {
  const { setAlert } = useContext(AlertContext);

  return useQuery("decks-and-cards", getDecksAndCards, {
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errors

    onError: (error) => {
      const message =
        (error as Error).message === "Network Error"
          ? "No internet connection"
          : (error as Error).message;
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: (error as AxiosErrorType)?.response?.data.message || message,
        autoHideDuration: 7000,
      }));
    },
  });
}
