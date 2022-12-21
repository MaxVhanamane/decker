
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { request } from './../utils/axios-utils';

type CardData={
    deck_id:string,
    oldContent:{oldContent:{title:string,note:string},index:number},
    newContent:{title:string,note:string}

  }

type PromiseData={
title:string;
_id:string;
cards:{title:string,note:string}[];
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
       toast.error("Error please try again!", {
     
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
     }
    })
}



export default useEditCard
