import { request } from './../utils/axios-utils';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
import { AlertContext } from '../context/AlertState';
import { AlertData } from '../types/types';
import { useContext } from 'react';


  type Data={
   deleteIndex:number,
   moveIndex:number,
   deck_id:string
  }
  
  type OldData={
    cards:{title:string,note:string}[];
    title:string;
  }
  

   const moveCard=async(data:Data)=>{
       const res = await request.put(`/card/changepostion/${data.deck_id}/${data.deleteIndex}/${data.moveIndex}`) 
        return res.data
  }
  
  
  const useMoveCard = ()=>{
    const {setAlert}=useContext(AlertContext) 
    const queryClient =useQueryClient()
    return useMutation(moveCard,{

      onMutate:async (data:Data)=>{
        await queryClient.cancelQueries(["cards",data.deck_id]);
       const previousCardData=queryClient.getQueryData(["cards",data.deck_id])
      queryClient.setQueryData<OldData | undefined>(["cards",data.deck_id],(oldCardData)=>{
     
        if(oldCardData){
          const newArray=[...oldCardData.cards] // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will refere the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
          let element_to_move = newArray.splice(data.deleteIndex, 1)[0];
          newArray.splice(data.moveIndex, 0, element_to_move)
          return {...oldCardData,cards:newArray}
        }
       })
    
       return {previousCardData}

      },



        onError:(error,data:Data,context)=>{
       
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

  export default useMoveCard
