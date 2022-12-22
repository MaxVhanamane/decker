import { request } from "../utils/axios-utils";
import { useMutation, useQueryClient } from 'react-query';
import { DeckTypes } from "./useGetDecks";

 const createDeck = async (title:string)=> {
  // you don't need to add try catch block as axios will automatically throw an error. 
  // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
    const response = await request.post(`/deck`, {title});
    return response.data

}


const useCreateDeck= ()=>{
    const queryClient=useQueryClient()
    // whatever we pass to useMutations mutate function that will be reaceived in the createDeck function and in onMutate and other properities of useMutation.
  return useMutation(createDeck,{
  
    onMutate:async(title:string)=>{
   await queryClient.cancelQueries("decks")
   // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
       // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        const previousQueryData=queryClient.getQueryData("decks")
              queryClient.setQueryData<DeckTypes[] | undefined>("decks",(oldQueryData)=>{
                if(oldQueryData){

                  return [{title,_id:Math.random().toString(),cards:[],pinned:false},...oldQueryData]
                }
           
        
        })
        // Return previous data so that if something goes wrong we can use this in onError method
        return previousQueryData

    },

    onError:(_error,_title,context)=>{
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to 
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that 
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will 
      // reverse that here using previousQuery data 
    
      queryClient.setQueryData("decks",context)
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled:()=>{
      queryClient.invalidateQueries("decks") 
    }

  })
}


export default useCreateDeck



 
