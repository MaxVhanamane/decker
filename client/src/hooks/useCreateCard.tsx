import { request } from './../utils/axios-utils';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';

type PayloadData={
    deck_id:string,
    content:string
  }
  // const createCard = async (id:string,content:string)=> {const response = await fetch(`http://localhost:5000/deck/${id}/card`, {
  //     method: "POST",
  //     body: JSON.stringify({ content }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
    
  // return response.json()
  // }
  
  // export default createCard
  
  
   const createCard=async(content:PayloadData)=>{
       const data =await  request.post(`/deck/${content.deck_id}/card`,{content:content.content})
        return data.data
  }
  
  
  const useCreateCard = ()=>{
    const queryClient =useQueryClient()
    return useMutation(createCard,{
        // Not doing any optimistic updates we will only show the data once it is added in the db.
        onSuccess:()=>{
          queryClient.invalidateQueries("cards") 
        },
        onError:(error)=>{
          console.log("Error please try again!")
        }
       })
  }

  export default useCreateCard
