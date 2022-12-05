import { request } from './../utils/axios-utils';
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


 export const deleteCard= async (payLoad:PayloadType) :Promise<DeckTypes>=>{
  const res= await request.delete(`${import.meta.env.VITE_APP_API_URL}/card/${payLoad.deck_id}/${payLoad.index}}`)
  return res.data
 }
