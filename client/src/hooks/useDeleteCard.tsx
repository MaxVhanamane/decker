import { request } from './../utils/axios-utils';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
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
// export const deleteCard = async (id:string,index:number):Promise<DeckTypes>=>{
//     const response = await fetch(`http://localhost:5000/card/${id}/${index}}`, {
//         method: "DELETE",
       
//       });
      
//       return response.json()
// }


 const deleteCard= async (payLoad:PayloadType) :Promise<DeckTypes>=>{
  const res= await request.delete(`/card/${payLoad.deck_id}/${payLoad.index}}`)
  return res.data
 }


 const useDeleteCard = () =>{
    const queryClient = useQueryClient()
     return useMutation(deleteCard,{
        // Not doing any optimistic updates we will only show the data once it is added in the db.
        onSuccess:()=>{
          queryClient.invalidateQueries("cards") 
        },
        onError:(error)=>{
          console.log("Error please try again!")
        }
       })
 }

 export default useDeleteCard
