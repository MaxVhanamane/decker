import { FormEvent, useState,useContext } from "react";
import { Link } from "react-router-dom";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {BsPin, BsTrash} from "react-icons/bs"
import {BsFillPinFill} from "react-icons/bs"
import { MdOutlineDeleteOutline} from "react-icons/md"
import useGetDecks from "../hooks/useGetDecks";
import useCreateDeck from "../hooks/useCreateDeck";
import useDeleteDeck from '../hooks/useDeleteDeck';
import usePinDeck from '../hooks/usePinDeck';
import { UserContext } from '../context/context'

import { toast } from 'react-toastify';

  function Deck() {
    const [title, setTitle] = useState<string>("");
    
    const {data:alldecks,error,isError,isLoading}=useGetDecks()
  
    const {mutate : addDeck} = useCreateDeck()

    const {mutate:deleteOneDeck}=useDeleteDeck()

    const {mutate:pinDeck,error:pinError,isError:isPinError}=usePinDeck()


    const handleSubmit = async (e: FormEvent) => {
      setTitle("")
      e.preventDefault();
      if(title.length>0){

        addDeck(title)
      }
      else{
        toast.info("The title of the deck should be at least 1 character long.");
      }
    };
  
  
    
    const handleDelete = async (id:string) => {
        deleteOneDeck(id)
    
    
    };
  
  
    const handlePin = async (id:string,pinned:boolean) => {
      pinDeck({id,pinned:!pinned})
    };
  
    
   
  
  
  


    if(isError){
      return  <div className="flex justify-center items-center h-screen w-full dark:bg-slate-900 dark:text-white"><p><span className="font-bold test-grray-800">Error </span>: {(error as Error).message}</p></div>
    }
   
    if(isLoading){
      return <div className="flex justify-center items-center h-screen w-full bg-white dark:bg-slate-900"><img src={localStorage.getItem("theme")==="dark"?"/loading44.gif":"/loadinggif.gif"} alt="loading_image" width={200} height={200}/></div>
    }
  
    return (
 
      <div className="flex flex-col gap-2 mt-8 mb-24 lg:mx-32  ">
        <Droppable droppableId="deleteArea">
          {
            (provided,snapshot)=>{
              return    <div className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-12 h-12 flex items-center justify-center ${snapshot.isDraggingOver? "ring-1 ring-red-500 shadow-md shadow-red-500":"ring-1 dark:ring-sky-500/40 ring-teal-500/40"}`} ref={provided.innerRef} {...provided.droppableProps}>
                
              <span  className={`text-3xl text-teal-600 dark:text-sky-400  ${snapshot.isDraggingOver? "rotate-[30deg] text-red-500 dark:text-red-500":"transform-none"} `}><BsTrash title="Drag and drop the deck item here for deletion."/></span>
             </div>
              
            }
          }
    
       </Droppable>



       
        <div className="w-full px-4 mx-auto ">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <label htmlFor="title" className="font-bold text-teal-700 dark:text-sky-400 ">
              Deck title
            </label>
            <input
              className=" dark:bg-slate-900 dark:border-sky-400 dark:text-white lg:w-96 w-80 py-1 border-2 border-[#459C98] outline-none focus:border-[#2e807b] text-gray-700 px-2 mx-4 rounded-md"
              type="text"
              id="title"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
              value={title}
            />
            <button className="bg-[#459C98] dark:bg-sky-500 dark:hover:bg-sky-600  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md ">Add Deck</button>
          </form>
        </div>
 
  

{alldecks!?.filter((deck)=>{return deck?.pinned===true}).length>0 ? <div className="mt-4 lg:mb-10  mx-1  " >
  <h1 className="text-left  text-md font-semibold text-gray-800 dark:text-gray-50  m-4">Pinned </h1>

        <Droppable droppableId="pinnedArea" isDropDisabled={true} >

          {

          (provided)=>{
           return   <div className=" flex flex-row flex-wrap gap-2  justify-center items-center p-2 lg:mx-20 " ref={provided.innerRef} {...provided.droppableProps}>

               {alldecks?.filter((deck)=>deck.pinned===true).map((deck,index) => {
                 return (
                  <Draggable draggableId={deck._id} index={index} key={deck._id}  shouldRespectForcePress>

                    {(provided,snapshot)=>{
                      // ${snapshot.draggingOver==="othersDeckArea" &&"border-violet-600 shadow-violet-600 shadow-2xl "} 
      return <div 
      className={`relative border  ${snapshot.isDragging ? "  border-sky-500 animate-pulse shadow-sky-500  shadow-2xl ": "border-gray-400 "} ${snapshot.draggingOver==="deleteArea" && "border-red-500 shadow-2xl shadow-red-500"}  
      
       text-gray-800 dark:text-gray-50 
                   rounded-md min-w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify`}
            ref={provided.innerRef}  
            {...provided.dragHandleProps}  
            {...provided.draggableProps} 
    >
    <div className="absolute bottom-0 right-0">
 <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none   rounded-tr text-sm px-1  text-center text-blue-700 dark:text-sky-400  hover:scale-105"><BsFillPinFill/></button>
 </div>

  <Link to={`cards/${deck._id}`} ><p className=" break-all font-semibold py-6"> {deck.title}</p> </Link>
 
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
  
       {alldecks!?.filter((deck)=>{return deck?.pinned===false}).length>0 ? <div className="mt-4 mb-24  mx-1" >
        <h1 className="text-left text-md font-semibold text-gray-800 m-4 dark:text-gray-50 "> {alldecks!?.filter((deck)=>{return deck?.pinned===true}).length>0 ?"Others": "Decks"} </h1>

        <Droppable droppableId="othersDeckArea" isDropDisabled={true} >

          {

          (provided)=>{
           return   <div className="  flex flex-row flex-wrap gap-2  justify-center items-center p-2 lg:mx-20 " ref={provided.innerRef} {...provided.droppableProps}>

               {alldecks?.filter((deck)=>deck.pinned===false).map((deck,index) => {
                 return (
                  <Draggable draggableId={deck._id} index={index+500} key={deck._id}>

                    {(provided,snapshot)=>{
                      //  ${snapshot.draggingOver==="pinnedArea" &&"border-yellow-500 shadow-yellow-500 shadow-2xl "} 
      return <div 
      className={`relative border  ${snapshot.isDragging ? "  border-sky-500 animate-pulse shadow-sky-500  shadow-2xl ": "border-gray-400 "} ${snapshot.draggingOver==="deleteArea" && "border-red-500 shadow-2xl shadow-red-500"} 
      text-gray-800 dark:text-gray-50 
                   rounded-md min-w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify`}
            ref={provided.innerRef}  
            {...provided.dragHandleProps}  
            {...provided.draggableProps} 
    >
      <div className="absolute bottom-0 right-0">
 <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none   rounded-tr text-sm px-1  text-center text-blue-700 dark:text-sky-400 hover:scale-105"><BsPin/></button>
 </div>

  <Link to={`cards/${deck._id}`} ><p className=" break-all font-semibold py-6"> {deck.title}</p> </Link>
 
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
  
  export default Deck;
