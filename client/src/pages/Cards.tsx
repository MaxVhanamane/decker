import { ChangeEvent, FormEvent, useState,useRef,MouseEvent } from "react";
import {useParams} from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from '../hooks/useDeleteCard';
import { MdOutlineDeleteOutline, MdOutlineModeEdit } from 'react-icons/md';
import { BiEdit } from 'react-icons/bi';
import useEditCard from '../hooks/useEditCard';
import { toast } from 'react-toastify';
import { Droppable,Draggable } from "react-beautiful-dnd";
import { BsTrash } from "react-icons/bs";
import { RiCloseFill } from 'react-icons/ri';
import Loading from './../componenets/Loading';
import PopUpMessage from "../componenets/PopUpMessage";
// let oldContent:string //this  works
type ContentType={
  title:string,
  note:string,
  _id:string,
  
}

type ContentTypeForEdit= ContentType & {
  index:number | null
}


type PayloadType={
  deck_id:string,
  content:ContentType
  
}
function Cards() {
  const [note, setNote] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [openModal,setOpenModal]=useState(false)
  const [indexOfCardForDeletion,setIndexOfCardForDeletion]=useState<number | null>(null)
  const deleteConfirmationModalForCard=useRef<HTMLDivElement | null >(null)
  const changeColorWhileDragging=useRef<HTMLDivElement | null >(null)
  const showPopUp=useRef<HTMLDivElement | null >(null)
  const { deck_id } = useParams();
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
  const {data,isError,error,isLoading}=useGetCards( deck_id!)
  const [editContent,setEditContent]=useState<ContentTypeForEdit>({title:"",note:"",_id:"",index:null})
   const {mutate:addCard,error:mutationError,isError:isMutationError}=useCreateCard()
   const {mutate:editCard,error:editMutationError,isError:isEditMutationError}=useEditCard()

   const {mutate:deleteCardItem,error:DeletemutationError,isError:isDeleteMutationError}=useDeleteCard()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(title.length>0 || note.length>0){
    
   const content={title,note,_id:deck_id!}
      const payload:PayloadType={deck_id:deck_id! ,content}
      addCard(payload)
      setNote("")
      setTitle("")
    
  }
  else{
    toast.info("Title or note should contain one or more characters!");

  }
 
  };


  const handleDelete = async (index:number) => {
    setIndexOfCardForDeletion(index)
    if(deleteConfirmationModalForCard?.current?.classList.contains("hidden")){
 }      deleteConfirmationModalForCard?.current?.classList.remove("hidden")

  };



 const handleEdit = (cardItem:ContentTypeForEdit)=>{

  setEditContent(cardItem)
  setOpenModal(true)
 }

 const handleSave =()=>{
  let data={
    deck_id:deck_id!,
    newContent:editContent,
    index:editContent.index!
  }
if(editContent.title.length>0 || editContent.note.length>0 ){
  
    editCard(data)
    setOpenModal(false)
  
}
else{
  toast.info("Title or note should contain one or more characters!");
}
 
 }

 const getUserConfirmation=(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>)=>{
  const payload={deck_id:deck_id!,index:indexOfCardForDeletion!}
  

  if((e.target as HTMLButtonElement).id==="yesbutton"){
    deleteCardItem(payload)
    deleteConfirmationModalForCard?.current?.classList.add("hidden")
  }
  else{
    deleteConfirmationModalForCard?.current?.classList.add("hidden")
  }
    }
      

 const handleChange = (e:ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)=>{
  if(e.target.name==="title"){
    setEditContent({...editContent,title:e.target.value})

  }
  else if(e.target.name==="note"){
    setEditContent({...editContent,note:e.target.value})

  }
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

  
 if(isLoading){
  return <Loading/>
}

  if (isError) {
    return <div className=" absolute top-0 left-0  w-full h-full flex items-center justify-center">
 <p><span className="font-bold dark:text-gray-50 text-gray-800">Error</span>: {(error as Error)?.message}</p>

    </div>
  }
  // if(isMutationError){
  //   return <p>Error{(mutationError as Error)?.message}</p>
  // }
  return (
    <>
<PopUpMessage message="Drag and drop the card here to delete it." showPopUp={showPopUp}/>


       <Droppable droppableId="cardDeleteArea">
          {
            (provided,snapshot)=>{
              return    <div className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-12 h-12 flex items-center justify-center ${snapshot.isDraggingOver? "ring-1 ring-red-500 shadow-md shadow-red-500":"ring-1 dark:ring-sky-500/40 ring-teal-500/40"}`}ref={provided.innerRef} {...provided.droppableProps}>
              <span  className={`text-3xl cursor-pointer text-teal-600 dark:text-sky-400  ${snapshot.isDraggingOver? "rotate-[30deg] text-red-500 dark:text-red-500":"transform-none"}  `}><BsTrash onClick={handlePopUp} title="Drag and drop the card here to delete it."/></span>
             </div>
            }
          }
    
       </Droppable>
       
    <div className="flex flex-col gap-2 mt-6 w-full  relative ">
    


      <div className="w-full px-4 mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
            Card details
          </label>
          <div className="flex flex-col ">
          <input type="text"   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
            }}  value={title}  className=" lg:w-[35rem] md:w-96 bg-white w-80 border-t-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-t-md font-semibold outline-none text-lg text-gray-800 px-3 py-2 dark:bg-slate-900 dark:text-gray-50 pb-2" placeholder="Title" />
          <textarea 
            className=" lg:w-[35rem] md:w-96 bg-white w-80 border-b-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 py-2 dark:bg-slate-900 dark:text-gray-50 resize-y "
            rows={2}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setNote(e.target.value);
            }}
            value={note}
            placeholder="Note"
          ></textarea>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-gray-50 font-semibold text-center py-1 px-2 rounded-md dark:bg-sky-500 dark:hover:bg-sky-600 outline-none ">Create Card</button>
        </form>
        <h1 className="font-bold text-xl text-gray-800 mb-6 dark:text-gray-50 mt-6">{data?.title} </h1>

      </div>
      {/* You can't use Draggable directly you have to use it inside Dropable component  */}
      <Droppable droppableId="cardDropableArea" >
          {
            (provided,snapshot)=>{
     return <div className="flex flex-row flex-wrap gap-4 justify-center items-center  mx-2 lg:mx-52 mb-16" ref={provided.innerRef} {...provided.droppableProps}>
        
          {data?.cards?.map((card,index) => {
            return (
              <Draggable draggableId={`${deck_id!}-${index}`} index={index} key={index} >
  
              {(provided,snapshot)=>{
               
             return <div  ref={provided.innerRef}  
              {...provided.dragHandleProps}  
              {...provided.draggableProps} 
                
                           key={index}
              >
                <div ref={changeColorWhileDragging} className={`relative border   ${snapshot.isDragging ? "shadow-2xl shadow-violet-600 border-violet-600  animate-pulse dark:bg-slate-900 bg-white": "border-gray-400 "} ${snapshot.draggingOver==="cardDeleteArea"?"shadow-2xl !shadow-red-500 !border-red-500 !bg-transparent":null}   flex flex-col text-gray-800
                rounded-md min-w-[8rem] px-4 py-6 min-h-[5.5rem]   text-justify max-w-full break-all `}>
                   <div className="absolute bottom-0 right-0">

 <button onClick={()=>{handleDelete(index)}} type="button" className="text-red-500 text-lg outline-none  rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handleEdit({...card,_id:deck_id!,index})}} type="button" className="text-blue-500 text-lg outline-none  rounded-tr px-1  text-center hover:scale-105 dark:text-sky-400"><BiEdit/></button>


 </div>
  <p className="font-bold text-lg text-gray-800 dark:text-gray-50 mb-1 p-1">{card.title}</p>
 <p className="text-base text-gray-800 dark:text-gray-100 p-1">{card.note}</p>
 </div>
              </div>
               }}

               </Draggable>
            );
          })}
    {provided.placeholder}
        </div>
  }
}

</Droppable>


    </div>
   
{ openModal?<div className="w-screen h-screen z-50  backdrop-blur-md lg:backdrop-blur-lg fixed inset-0 flex items-center justify-center ">
 <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] lg:w-1/3 dark:shadow-sm dark:shadow-slate-500">
 
  {/* modal head  */}
  <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
   <h2 className="py-2 px-4 text-left text-white font-bold ">Edit Card</h2>
  </div>
  {/* modal content  */}
  <div className=" px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50">
  <input value={editContent.title} onChange={handleChange} name="title" className="px-4 py-2 w-full outline-none rounded-t-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 " placeholder="Title" />
   <textarea value={editContent.note} onChange={handleChange} name="note" className="px-4 py-2 w-full outline-none text-gray-800 rounded-b-md  dark:bg-slate-800 dark:text-gray-50 h-[65vh] resize-none"  placeholder="Note"></textarea>
  </div>

 
  {/* modal footer  */}
  <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
<button onClick={handleSave} className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4">Save</button>
<button onClick={()=>{setOpenModal(false)}} className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white">Cancel</button>
  </div>
</div>

 </div>:null}

 <div ref={deleteConfirmationModalForCard} id="popup-modal" tabIndex={-1} className="fixed hidden z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 backdrop-blur-sm">
    <div className="relative w-full h-full flex items-center justify-center  ">
        <div className="relative bg-white rounded-lg shadow-md dark:shadow-md shadow-teal-500 dark:shadow-sky-500 dark:bg-slate-900 ring-1 ring-sky-500  ">
           
            <div className="p-6 text-center">
                <svg aria-hidden="true" className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this card?</h3>
                <button id="yesbutton" onClick={getUserConfirmation} data-modal-toggle="popup-modal" type="button" className="text-white bg-red-600 hover:bg-red-800    font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none">
                    Yes, I'm sure
                </button>
                <button id="nobutton" onClick={getUserConfirmation} data-modal-toggle="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none">No, cancel</button>
            </div>
        </div>
    </div>
</div>

</>
  );
}

export default Cards;
