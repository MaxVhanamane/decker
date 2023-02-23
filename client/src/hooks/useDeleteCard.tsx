import { request } from "./../utils/axios-utils";
import { useMutation } from "react-query";
import { useQueryClient } from "react-query";
import { AlertContext } from "../context/AlertState";
import { AlertData, AxiosErrorType, CardDataType } from "../types/types";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
export type DeckTypes = {
  success: boolean;
  cards: { _id: string; title: string; cards: string[] };
};
type PayloadType = {
  deck_id: string;
  index: number;
};

export type OldData = {
  cards: { title: string; note: string; _id: string }[];
  title: string;
};

const deleteCard = async (payLoad: PayloadType): Promise<DeckTypes> => {
  const res = await request.delete(
    `/card/${payLoad.deck_id}/${payLoad.index}`
  );
  return res.data;
};

const useDeleteCard = () => {
  const {showSearchBar}=useContext(UserContext)
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(deleteCard, {
    onMutate: async (data: PayloadType) => {
      await queryClient.cancelQueries(["cards", data.deck_id]);
      const previousQueryData: CardDataType[] = queryClient.getQueryData([
        "cards",
        data.deck_id,
      ])!;
      queryClient.setQueryData<OldData | undefined>(
        ["cards", data.deck_id],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData?.cards];
            newArray.splice(data.index, 1);
            return { ...oldQueryData, cards: newArray };
          }
        }
      );
      return previousQueryData;
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data, context) => {
      if (error) {
        queryClient.setQueryData(["cards", data.deck_id], context);
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: (error as AxiosErrorType)?.response?.data.message || (error as Error).message,
        }));
      }
      queryClient.invalidateQueries(["cards", data.deck_id]);
      // If the search bar is open, it means that the user has deleted the card after searching. As I am using the "decks" query for searching, I need updated data, so I will invalidate the query and retrieve fresh data.
      if(showSearchBar){
      queryClient.invalidateQueries("decks");
      }
    },
  });
};

export default useDeleteCard;
