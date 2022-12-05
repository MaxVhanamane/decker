import { request } from "../utils/axios-utils";

// export const getCards = async (_id:string):Promise<string[]>=>{
//     const cards = await request.get(`http://localhost:5000/cards/${_id}`);
//     return cards.data;
// }
type Data={
  title:string;
  cards:string[];
}

 export const getCards=async (_id:string):Promise<Data>=>{
   const data= await request.get(`/cards/${_id}`)
   return data.data
}

