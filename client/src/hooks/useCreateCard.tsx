import { request } from './../utils/axios-utils';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
import { AlertContext } from '../context/AlertState';
import { AlertData } from '../types/types';
import { useContext } from 'react';
type PayloadData={
    deck_id:string,
    content:{
      title:string,
      note:string
    }
  }

  type OldData={
    cards:{title:string,note:string}[];
    title:string;
  }
  
  
   const createCard=async(content:PayloadData)=>{
       const data =await  request.post(`/card/${content.deck_id}`,{content:content.content})
        return data.data
  }
  
  
  const useCreateCard = ()=>{
    const {setAlert}=useContext(AlertContext) 
    const queryClient =useQueryClient()
    return useMutation(createCard,{

      onMutate:async (data:PayloadData)=>{
        await queryClient.cancelQueries(["cards",data.deck_id]);
       const previousCardData=queryClient.getQueryData(["cards",data.deck_id])
      queryClient.setQueryData<OldData | undefined>(["cards",data.deck_id],(oldCardData)=>{
     
        if(oldCardData){
          const newArray=[...oldCardData.cards] // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will refere the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
          
          newArray.unshift(data.content)
          return {...oldCardData,cards:newArray}
        }
       })
    
       return {previousCardData}

      },



        onError:(error,data:PayloadData,context)=>{
       
           setAlert((preval:AlertData) => (
        {
          ...preval,
          severity: "error",
          show: true,
          message: "Some error occured, please try again!"
        }))
       
          queryClient.setQueryData(["cards",data.deck_id],context)
        },
        onSettled:(dataReturnedByTheAxiosRequest, error, dataThatWePassed, context)=>{
          queryClient.invalidateQueries(["cards",dataThatWePassed.deck_id])
        }
        
        
       })


      
  }

  export default useCreateCard
