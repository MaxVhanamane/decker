import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CardDataType } from "../types/types";

type Data = {
  deleteIndex: number;
  moveIndex: number;
  deck_id: string;
};

type OldData = {
  cards: { title: string; note: string }[];
  title: string;
};

const moveCard = async (inputData: Data) => {
  try {
    const data = await request.put(
      `/card/changeposition/${inputData.deck_id}/${inputData.deleteIndex}/${inputData.moveIndex}`
    );

    if (data?.message) {
      return { message: data?.message, status: data?.status };
    } else {
      return data?.data;
    }
  } catch (error) {
    return {
      message:
        "An unexpected error occurred while moving the card. Please try again later.",
      status: 400,
    };
  }
};

const useMoveCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveCard,
    onMutate: async (data: Data) => {
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
            const newArray = [...oldCardData.cards]; // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will refere the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
            let element_to_move = newArray.splice(data.deleteIndex, 1)[0];
            newArray.splice(data.moveIndex, 0, element_to_move);
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      return previousCardData;
    },
    onSuccess: (data) => {
      if (data && "message" in data) {
        if (data?.message) {
          throw new Error(data?.message);
        } else {
          throw new Error(
            "An unexpected error occurred while moving the card. Please try again later."
          );
        }
      }
    },

    onError: (error, data: Data, context) => {
      queryClient.setQueryData(["cards", data.deck_id], context);
    },
    onSettled: (
      dataReturnedByTheAxiosRequest,
      error,
      dataThatWePassed,
      context
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", dataThatWePassed.deck_id],
      });
    },
  });
};

export default useMoveCard;
