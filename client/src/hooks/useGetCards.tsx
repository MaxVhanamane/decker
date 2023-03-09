import { request } from "../utils/axios-utils";
import { useQuery } from 'react-query';
import { Data } from "../types/types";


// export const getCards = async (_id:string):Promise<string[]>=>{
//     const cards = await request.get(`http://localhost:5000/cards/${_id}`);
//     return cards.data;
// }


 const getCards=async (_id:string):Promise<Data>=>{
   const data= await request.get(`/cards/${_id}`)
   return data.data
}


const useGetCards =(deck_id:string)=>{

    return useQuery(["cards",deck_id],()=>{return getCards(deck_id)},{
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 3, // Retry up to 3 times on network errors
    })
}

export default useGetCards
