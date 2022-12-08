import { request } from "../utils/axios-utils";
import { useQueryClient } from 'react-query';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

type DataType = {
  id: string;
  pinned: boolean
}

type DeckTypes = {
  _id: string;
  title: string;
  cards:string[];
  pinned:boolean;
};
export const updateDeck = async (data: DataType) => {
  // you don't need to add try catch block as axios will automatically throw an error. 
  // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
  const response = await request.put(`/deck`, { id:data.id, pinned: data.pinned, });
    return response.data


}

const usePinDeck = ()=>{
    const queryClient=useQueryClient()
    return useMutation(updateDeck,{
         onMutate:async(data:DataType)=>{
         await queryClient.cancelQueries("deck")
         const previousQueryData=queryClient.getQueryData<DeckTypes[]>("decks")
        const newQueryData= previousQueryData?.map(item=>{
          if (item._id===data.id){
            return {...item,pinned:data.pinned}
          }
          else {
            return item
          }
         })
       
         queryClient.setQueryData<DeckTypes[] | undefined>("decks",()=>{
  return newQueryData
     
  
  })
  return previousQueryData
         },

         onError:(error,_title,context)=>{
          toast.error(((error as Error).message), {
            position: "top-left",
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
          queryClient.setQueryData("decks",context)
        }, 

        onSettled:()=>{
          queryClient.invalidateQueries("decks") 
        }


        }
          )
}

export default usePinDeck
