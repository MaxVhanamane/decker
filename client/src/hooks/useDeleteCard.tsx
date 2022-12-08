import { request } from './../utils/axios-utils';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
export type DeckTypes = {
    success:boolean,
    cards:{_id: string;
    title: string;
    cards:string[]}
  };
  type PayloadType={
    deck_id:string;
    index:number
  }


  type OldData={
    cards:string[];
    title:string;
  }
  

 const deleteCard= async (payLoad:PayloadType) :Promise<DeckTypes>=>{
  const res= await request.delete(`/card/${payLoad.deck_id}/${payLoad.index}}`)
  return res.data
 }


 const useDeleteCard = () =>{
    const queryClient = useQueryClient()
     return useMutation(deleteCard,{

      onMutate:async(data:PayloadType)=>{
        await queryClient.cancelQueries(["cards",data.deck_id])
        const previousQueryData=queryClient.getQueryData(["cards",data.deck_id])
        queryClient.setQueryData<OldData | undefined>(["cards",data.deck_id],(oldQueryData)=>{
          if(oldQueryData){
            const newArray=[...oldQueryData?.cards]
            newArray.splice(data.index,1)
            console.log("newarra",newArray)
            return {...oldQueryData,cards:newArray}
          }
        })
        return previousQueryData
      },
    
      // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
        onSettled:(serverData,error,data,context)=>{
          if(error){
            queryClient.setQueryData(["cards",data.deck_id],context) 
            toast.error(((error as Error).message));
          }
         queryClient.invalidateQueries(["cards",data.deck_id])
        }
       })
 }

 export default useDeleteCard
