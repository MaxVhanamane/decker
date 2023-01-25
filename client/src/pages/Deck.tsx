import { FormEvent, useState,useRef, MouseEvent,useContext,RefObject} from "react";
import { Link } from "react-router-dom";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {BsPin, BsTrash} from "react-icons/bs"
import {BsFillPinFill} from "react-icons/bs"
// import { MdOutlineDeleteOutline} from "react-icons/md"
import useGetDecks from "../hooks/useGetDecks";
import useCreateDeck from "../hooks/useCreateDeck";
import useDeleteDeck from '../hooks/useDeleteDeck';
import usePinDeck from '../hooks/usePinDeck';
import { AlertContext } from '../context/AlertState';
import { RiCloseFill } from 'react-icons/ri';
import EditModalForDeck from "../components/EditModalForDeck";
import { BiEdit } from 'react-icons/bi';
import Loading from '../components/Loading';
import PopUpMessage from "../components/PopUpMessage";
import { DeckType,AlertData, DeckTypeWithIndex  } from ".././types/types";
import useUndoDeck from './../hooks/useUndoDeck';
import {Helmet} from "react-helmet";
type PropType={
  undoDeck:DeckTypeWithIndex | null,
  handleUndoDeck:(deck:DeckTypeWithIndex | null)=>void,
  undoButtonRef:RefObject<HTMLDivElement>,
  handlePopupForUndoButton:()=>void
}
  function Deck({undoDeck,handleUndoDeck,undoButtonRef,handlePopupForUndoButton}:PropType) {
    const {setAlert}=useContext(AlertContext) 
    const [title, setTitle] = useState<string>("");
    // const [deleteDeckId,setDeleteDeckId]=useState("")
    const {data:alldecks,error,isError,isLoading}=useGetDecks()
  const [openEditDeckModal,setOpenEditDeckModal]=useState(false)
    const {mutate : addDeck} = useCreateDeck()

    const [editData,setEditData]=useState({deck_id:"",title:""})

    // const {mutate:deleteOneDeck}=useDeleteDeck()

    const {mutate:pinDeck,error:pinError,isError:isPinError}=usePinDeck()
    const {mutate:undoDeckItem,error:undoError,isError:isUndoError}=useUndoDeck()
 
    // const deleteConfirmationModal=useRef<HTMLDivElement | null >(null)
    const showPopUp=useRef<HTMLDivElement | null >(null)
    
    const handleSubmit = async (e: FormEvent) => {
      setTitle("")
      e.preventDefault();
      if(title.length>0){

        addDeck(title)
      }
      else{
        setAlert((preval:AlertData) => (
          {
            ...preval,
            severity: "warning",
            show: true,
            message: "The deck title should be at least one character long."
          }))
      }
    };
  
//   const getUserConfirmation=(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>)=>{
// if((e.target as HTMLButtonElement).id==="yesbutton"){
//   deleteOneDeck(deleteDeckId)
//   deleteConfirmationModal?.current?.classList.add("hidden")
// }
// else{
//   deleteConfirmationModal?.current?.classList.add("hidden")
// }
//   }
    
  //   const handleDelete = async (id:string) => {
  //     setDeleteDeckId(id)
  //     if(deleteConfirmationModal?.current?.classList.contains("hidden")){
  //       deleteConfirmationModal.current.classList.remove("hidden")
  //  }
  
 
  //   };
  
  
    const handlePin = async (id:string,pinned:boolean) => {
     
      pinDeck({id,pinned:!pinned})
    };
  
    
    const handleEditDeck=(deck_id:string,title:string)=>{
      setEditData({...editData,deck_id,title})
      setOpenEditDeckModal(true)

    }
   
    const handlePopUp=()=>{
      if(showPopUp.current?.classList.contains("scale-0")){
        showPopUp.current.classList.remove("scale-0")
        showPopUp?.current?.classList.add("!block")
        showPopUp.current.classList.add("!w-fit")
        showPopUp.current.classList.add("!h-fit")
        showPopUp.current.classList.add("scale-100")
    
        setTimeout(()=>{
          showPopUp?.current?.classList.remove("scale-100")
        showPopUp?.current?.classList.add("scale-0")
        showPopUp?.current?.classList.add("hidden")
        },3000)
       
      }
    
     }
  
  
   
  
  const handleUndo=()=>{
    // request.put("/undodeck",undoDeck) 
    undoDeckItem(undoDeck!)
    handleUndoDeck(null)
    handlePopupForUndoButton()
  }


    if(isError){
      return  <div className=" absolute top-0 left-0  w-full h-full flex items-center justify-center text-gray-800 dark:text-gray-50 "><p className="font-semibold"><span className="font-bold">Error </span>: {(error as Error)?.message}</p></div>
    }
   
    if(isLoading){
      return <Loading/>
    }
  
    return (
 <>
   <Helmet>
    <title>Decks</title>
        <meta name="description" content="Organize and manage your information with ease using our customizable decks.create different decks to keep all your important information in one place."/>
      </Helmet>
      <div className="flex flex-col gap-2 mt-8 mb-24 lg:mx-32 ">
{<div ref={undoButtonRef}  className=" transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800  rounded-lg z-50 dark:text-gray-50 p-4 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500  fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2"><span className="mr-4">Deck deleted successfully!</span><span className="cursor-pointer font-bold text-blue-700 dark:text-yellow-400" onClick={(event)=>{handleUndo()}}>Undo</span></div>}
<PopUpMessage message="Drag and drop the deck here to delete it." showPopUp={showPopUp}/>
        <Droppable droppableId="DeckDeleteArea">
          {
            (provided,snapshot)=>{
              return    <div className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${snapshot.isDraggingOver? "ring-1 ring-red-500 shadow-md shadow-red-500":"ring-1 dark:ring-sky-500/40 ring-teal-500/40"}`} ref={provided.innerRef} {...provided.droppableProps}>
                
              <span  className={`text-2xl lg:text-3xl text-teal-600 dark:text-sky-400 cursor-pointer ${snapshot.isDraggingOver? "rotate-[30deg] text-red-500 dark:text-red-500":"transform-none"} `}><BsTrash onClick={handlePopUp} title="Drag and drop the deck here to delete it."/></span>
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
              className=" dark:bg-slate-900 dark:border-sky-400 dark:text-white lg:w-96 w-80 py-1 border-2 border-teal-600 outline-none focus:border-teal-700 text-gray-700 px-2 mx-4 rounded-md"
              type="text"
              id="title"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
              value={title}
            />
            <button  className="bg-[#459C98] dark:bg-sky-500 dark:hover:bg-sky-600  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md " aria-label="Add Deck">Add Deck</button>
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
      className={`relative border  ${snapshot.isDragging ? "border-sky-500 animate-pulse  shadow-2xl shadow-sky-500 dark:bg-slate-900 bg-white  ": "border-gray-400 "} ${snapshot.draggingOver==="deleteArea" && "!border-red-500 !shadow-2xl !shadow-red-500 !bg-transparent"}  
      
       text-gray-800 dark:text-gray-50 
                   rounded-md min-w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify`}
            ref={provided.innerRef}  
            {...provided.dragHandleProps}  
            {...provided.draggableProps} 
    >
    <div className="absolute bottom-0 right-0">
 {/* <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button> */}

 <button onClick={()=>{handleEditDeck(deck._id,deck.title)}} type="button" className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400" aria-label="Edit Deck"><BiEdit/></button>
 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-500 hover:scale-95" aria-label="Pin Deck"><BsFillPinFill/></button>
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
      className={`relative border  ${snapshot.isDragging ? " z-50 border-sky-500 animate-pulse  shadow-2xl shadow-sky-500 dark:bg-slate-900 bg-white ": "border-gray-400 "} ${snapshot.draggingOver==="deleteArea" && "!border-red-500 !shadow-2xl !shadow-red-500 !bg-transparent"} 
      text-gray-800 dark:text-gray-50 
                   rounded-md min-w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify `}
            ref={provided.innerRef}  
            {...provided.dragHandleProps}  
            {...provided.draggableProps} 
    >
      <div>
      <div className="absolute bottom-0 right-0">
 {/* <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button> */}
 
 <button onClick={()=>{handleEditDeck(deck._id,deck.title)}} type="button" className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400" aria-label="Edit Deck"><BiEdit/></button>

 <button onClick={()=>{handlePin(deck._id,deck.pinned)}} type="button" className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-600 dark:text-red-500 hover:scale-95" aria-label="Pin Deck"><BsPin/></button>
 </div>

  <Link to={`cards/${deck._id}`} ><p className=" break-all font-semibold py-6"> {deck.title}</p> </Link>
  </div>
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
{/*     
        <div ref={deleteConfirmationModal} id="popup-modal" tabIndex={-1} className="fixed hidden z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 backdrop-blur-sm">
    <div className="relative w-full h-full flex items-center justify-center  ">
        <div className="relative bg-white rounded-lg shadow-md dark:shadow-md shadow-teal-500 dark:shadow-sky-500 dark:bg-slate-900 ring-1 ring-sky-500  ">
            <div className="p-6 text-center">
                <svg aria-hidden="true" className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this deck?</h3>
                <button id="yesbutton" onClick={getUserConfirmation} data-modal-toggle="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800    font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none">
                    Yes, I'm sure
                </button>
                <button id="nobutton" onClick={getUserConfirmation} data-modal-toggle="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none">No, cancel</button>
            </div>
        </div>
    </div>
</div> */}
{openEditDeckModal?<EditModalForDeck openEditDeckModal={openEditDeckModal} setOpenEditDeckModal={setOpenEditDeckModal} editData={editData} setEditData={setEditData} />:null}
      </div>
      </>


    );
    
  }
  
  export default Deck;
