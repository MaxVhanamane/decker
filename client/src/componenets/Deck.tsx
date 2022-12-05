import { FormEvent, useState, useEffect } from "react";
import createDeck from '../api/createdeck';
import { DeckTypes, getDecks } from "../api/getdecks";
import  deleteDeck  from "../api/deletedeck";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import updateDeck from './../api/updatedeck';
import { Draggable, Droppable } from "react-beautiful-dnd";

import {BsPin} from "react-icons/bs"
import {BsFillPinFill} from "react-icons/bs"
import {MdOutlineDeleteOutline} from "react-icons/md"

  function Home() {
    const [title, setTitle] = useState<string>("");
    const queryClient=useQueryClient()
  
    const {mutate : addDeck} = useMutation(createDeck,{
  
      onMutate:async(title:string)=>{
        setTitle("")
     await queryClient.cancelQueries("decks")
     // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
         // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          const previousQueryData=queryClient.getQueryData("decks")
                queryClient.setQueryData("decks",(oldQueryData)=>{
                  {/* @ts-ignore*/}
          return [...oldQueryData,{title,_id:Math.random().toString()}]
             
          
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

    const {mutate:deleteOneDeck}=useMutation(deleteDeck,{
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



    const {mutate:pinDeck}=useMutation(updateDeck,{
    onSuccess:()=>{
      queryClient.invalidateQueries("decks")
    }
    }
      )
   



    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if(title.length>0){

        addDeck(title)
      }
      else{
        alert("The title of the deck should be at least 1 character long.")
      }
    };
  
    
    const handleDelete = async (id:string) => {
        deleteOneDeck(id)
    
    
    };
  
  
    const handlePin = async (id:string,pinned:boolean) => {
      pinDeck({id,pinned:!pinned})
    };
  
    
   
  
  
  
    const {data:alldecks,error,isError,isLoading}=useQuery("decks",getDecks)
    if(isError){
      return <p>Error {(error as Error).message}</p>
    }
   
    if(isLoading){
      return <div className="flex justify-center items-center h-screen w-full"><p>Loading the decks...</p></div>
    }
  
    return (
 
      <div className="flex flex-col gap-2 mt-20 ">
  

        <div className="w-full px-4 mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <label htmlFor="title" className=" flex justify-center items-center">
              Deck title
            </label>
            <input
              className=" lg:w-96 w-80 py-1 border-2 border-gray-500 text-gray-900 px-2 mx-4 rounded-md"
              type="text"
              id="title"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
              value={title}
            />
            <button className="bg-[#459C98] hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md ">Add Deck</button>
          </form>
        </div>

    {alldecks!.filter((deck)=>{return deck?.pinned===true}).length>0 ? <div className="mt-4 mb-10  p-4 mx-4  " >
  <h1 className="text-left text-left text-lg font-semibold text-gray-800  m-4">Pinned </h1>

  <Droppable droppableId="pinnedArea">
    {(provided)=>{
      return <div className="flex flex-row flex-wrap gap-4 justify-center items-center mx-10 p-2 " ref={provided.innerRef} {...provided.droppableProps}>
        {alldecks?.filter((deck)=>{return deck.pinned===true}).map((deck,index) => {
          return (
            <Draggable draggableId={deck._id} index={index} key={deck._id}>
  
  {(provided)=>(
  <div 
  className="relative bg-gray-200  flex text-gray-800
               rounded-md w-fit px-16 py-8 h-fit text-center my-auto justify-center items-center break-all max-w-full "
         ref={provided.innerRef}    
         {...provided.dragHandleProps}
         {...provided.draggableProps}
>
  <div className="absolute bottom-0 right-0">
 <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none  font-bold rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none  font-bold rounded-tr text-sm px-1  text-center text-blue-700 hover:scale-105"><BsFillPinFill/></button>
 </div>

<Link to={`cards/${deck._id}`} > {deck.title} </Link>
</div>
  )}

            </Draggable>
          
              
          );
        })}
     {provided.placeholder}
      </div>
   
    }}
        
        </Droppable>
        </div>:null}
  
       {alldecks!.filter((deck)=>{return deck?.pinned===false}).length>0 ? <div className="mt-6 mb-10  p-4 mx-4" >
        <h1 className="text-left text-lg font-semibold text-gray-800 m-4"> {alldecks!.filter((deck)=>{return deck?.pinned===true}).length>0 ?"Others": "Decks"} </h1>

        <Droppable droppableId="deckArea" >

          {

          (provided)=>{
           return   <div className="flex flex-row flex-wrap gap-4 justify-center items-center mx-10" ref={provided.innerRef} {...provided.droppableProps}>

               {alldecks?.filter((deck)=>deck.pinned===false).map((deck,index) => {
                 return (
                  <Draggable draggableId={deck._id} index={index} key={deck._id}>

                    {(provided)=>{
      return <div 
      className="relative bg-gray-200  flex text-gray-800
                   rounded-md w-fit px-16 py-8 h-fit text-center my-auto justify-center items-center break-all max-w-full "
            ref={provided.innerRef}  
            {...provided.dragHandleProps}  
            {...provided.draggableProps} 
    >
      
      <div className="absolute bottom-0 right-0">
 <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none  font-bold rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none  font-bold rounded-tr text-sm px-1  text-center text-blue-700 hover:scale-105"><BsPin/></button>
 </div>


  <Link to={`cards/${deck._id}`} > {deck.title} </Link>
 
    </div>
   
                    }
            
                    }
             
                   </Draggable>
                 );
               })}
               {provided.placeholder}
             </div>
               
          
          }
          


          }
       
        </Droppable>
        </div>:null}
 
      </div>
 


    );
    
  }
  
  export default Home;
