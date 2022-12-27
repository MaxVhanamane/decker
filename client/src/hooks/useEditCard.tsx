
import { useMutation, useQueryClient } from 'react-query';
import { request } from './../utils/axios-utils';
import { OldData } from './useDeleteCard';
import { AlertContext } from '../context/AlertState';
import { AlertData } from '../types/types';
import { useContext } from 'react';

type CardData={
    deck_id:string,
    newContent:{title:string,note:string,_id:string}
    index:number

  }

  type QueryData={
    title:string;
    note:string;
    _id:string
  }

type PromiseData={
title:string;
_id:string;
cards:{title:string,note:string}[];
pinned:boolean
}
const editCard =async(cardData:CardData):Promise<PromiseData>=>{
    const data =await  request.put(`/card/${cardData.deck_id}`,{index:cardData.index,newContent:{title:cardData.newContent.title,note:cardData.newContent.note}})
    return data.data
}

const useEditCard = ()=>{
  const {setAlert}=useContext(AlertContext) 
    const queryClient =useQueryClient()
 return useMutation(editCard,{

  onMutate:async(data)=>{
    await queryClient.cancelQueries(["cards",data.deck_id])
        const previousQueryData=queryClient.getQueryData(["cards",data.deck_id])

        queryClient.setQueryData<OldData | undefined>(["cards",data.deck_id],(oldQueryData)=>{
          if(oldQueryData){
            const newArray: QueryData[] = [...oldQueryData?.cards];
            newArray.splice(data.index,1,data.newContent)
            return {...oldQueryData,cards:newArray}
          }
        })
         // Return previous data so that if something goes wrong we can use this in onError method
         return previousQueryData
 
     },
   // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
   onSettled:(serverData,error,data,context)=>{
    if(error){
      queryClient.setQueryData(["cards",data.deck_id],context) 
      setAlert((preval:AlertData) => (
        {
          ...preval,
          severity: "error",
          show: true,
          message: "Some error occured, please try again!"
        }))
    }
   queryClient.invalidateQueries(["cards",data.deck_id])
  }
   
    })
}



export default useEditCard
