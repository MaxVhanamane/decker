import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CardDataType } from "../types/types";
import { CustomError } from "../utils/customError";

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

    return data?.data;
  } catch (error) {
    // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onMutate: async (data: PayloadData) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
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
      queryClient.setQueryData(["cards", data.deck_id], context);
    },
    onSettled: (
      _dataReturnedByTheAxiosRequest,
      _error,
      dataThatWePassed,
      _context
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", dataThatWePassed.deck_id],
      });
    },
    retry: false,
  });
};

export default useCreateCard;
