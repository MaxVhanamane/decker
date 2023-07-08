import { request } from "./../utils/axios-utils";
import { useMutation } from "react-query";
import { useQueryClient } from "react-query";
import { AlertContext } from "../context/AlertContext";
import { AlertData, AxiosErrorType, CardDataType } from "../types/types";
import { useContext } from "react";

type PayloadData = {
  deck_id: string;
  content: {
    title: string;
    note: string;
    cardId: string;
  };
};

type OldData = {
  cards: { title: string; note: string; cardId: string }[];
  title: string;
};

const createCard = async (payload: PayloadData) => {
  try {
    const data = await request.post(`/card/${payload.deck_id}`, {
      content: payload.content,
    });
    return data.data;
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

const useCreateCard = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(createCard, {
    onMutate: async (data: PayloadData) => {
      await queryClient.cancelQueries(["cards", data.deck_id]);
      const previousCardData: CardDataType[] = queryClient.getQueryData([
        "cards",
        data.deck_id,
      ])!;
      queryClient.setQueryData<OldData | undefined>(
        ["cards", data.deck_id],
        (oldCardData) => {
          if (oldCardData) {
            // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will refere the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.

            const newArray = [...oldCardData.cards];
            newArray.unshift(data.content);
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      return previousCardData;
    },

    onError: (error, data: PayloadData, context) => {
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

      queryClient.setQueryData(["cards", data.deck_id], context);
    },
    onSettled: (
      dataReturnedByTheAxiosRequest,
      error,
      dataThatWePassed,
      context
    ) => {
      queryClient.invalidateQueries(["cards", dataThatWePassed.deck_id]);
    },
  });
};

export default useCreateCard;
