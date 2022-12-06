import { request } from "../utils/axios-utils";
import { useMutation, useQueryClient } from 'react-query';

const  deleteDeck = async (id:string)=> {
  try{
    const response = await request.delete(`/deck/${id}`);
    return response.data
  }
  
 catch(error){
  return error
 }

}


const useDeleteDeck =()=>{
    const queryClient=useQueryClient()
    return useMutation(deleteDeck,{
        onMutate:async(_id:string)=>{
            await queryClient.cancelQueries("decks")
            // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                 const previousQueryData=queryClient.getQueryData("decks")
                       queryClient.setQueryData("decks",(oldQueryData)=>{
                         {/* @ts-ignore*/}
                         const newData= oldQueryData.filter((d)=>{
                                return d._id != _id
                         })
                 return newData
                    
                 
                 })
                 // Return previous data so that if something goes wrong we can use this in onError method
                 // you can pass it in object or you can pass it directly like I did above in create deck
                 return {previousQueryData}
         
             },
       
             onError:(error,_title,context)=>{
                     // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to 
        // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that 
        // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will 
        // reverse that here using previousQuery data 
               queryClient.setQueryData("decks",context?.previousQueryData)
               alert(error)
             },
       
             // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
             onSettled:()=>{
               queryClient.invalidateQueries("decks") 
             }
    })
}

export default useDeleteDeck
