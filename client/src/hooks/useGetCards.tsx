import { request } from "../utils/axios-utils";
import { useQuery } from 'react-query';

// export const getCards = async (_id:string):Promise<string[]>=>{
//     const cards = await request.get(`http://localhost:5000/cards/${_id}`);
//     return cards.data;
// }
type Data={
  title:string;
  cards:{title:string,note:string}[];
}

 const getCards=async (_id:string):Promise<Data>=>{
   const data= await request.get(`/cards/${_id}`)
   return data.data
}


const useGetCards =(deck_id:string)=>{
    return useQuery(["cards",deck_id],()=>{return getCards(deck_id)})
}

export default useGetCards
