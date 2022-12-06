import { request } from "../utils/axios-utils";
import { useQueryClient } from 'react-query';
import { useMutation } from 'react-query';

type DataType = {
  id: string;
  pinned: boolean
}


export const updateDeck = async (data: DataType) => {
  // you don't need to add try catch block as axios will automatically throw an error. 
  // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
  const response = await request.put(`/deck`, { id: data.id, pinned: data.pinned, });
  return response.data

}

const useUpdateDeck = ()=>{
    const queryClient=useQueryClient()
    return useMutation(updateDeck,{
        onSuccess:()=>{
          queryClient.invalidateQueries("decks")
        }
        }
          )
}

export default useUpdateDeck
