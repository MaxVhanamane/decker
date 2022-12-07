
import { useMutation, useQueryClient } from 'react-query';
import { request } from './../utils/axios-utils';

type CardData={
    deck_id:string,
    oldContent:{oldContent:string,index:number},
    newContent:string

  }

type PromiseData={
title:string;
_id:string;
cards:string[];
pinned:boolean
}
const editCard =async(cardData:CardData):Promise<PromiseData>=>{
    const data =await  request.put(`/card/${cardData.deck_id}`,{index:cardData.oldContent.index,oldContent:cardData.oldContent.oldContent,newContent:cardData.newContent})
    return data.data
}

const useEditCard = ()=>{
    const queryClient =useQueryClient()
 return useMutation(editCard,{
     // Not doing any optimistic updates we will only show the data once it is added in the db.
     onSuccess:()=>{
       queryClient.invalidateQueries("cards") 
     },
     onError:(error)=>{
       console.log("Error please try again!")
     }
    })
}



export default useEditCard
