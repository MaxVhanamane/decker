import { ChangeEvent, FormEvent, useState,useRef,MouseEvent,useContext,Dispatch } from "react";
import {useParams} from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from '../hooks/useDeleteCard';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { BiEdit } from 'react-icons/bi';
import useEditCard from '../hooks/useEditCard';
import { Droppable,Draggable } from "react-beautiful-dnd";
import { BsTrash } from "react-icons/bs";
import Loading from '../components/Loading';
import PopUpMessage from "../components/PopUpMessage";
import { AlertContext } from '../context/AlertState';
import { AlertData } from '../types/types';
import { RiCloseFill } from 'react-icons/ri';
import { IoIosArrowRoundBack } from 'react-icons/io';
import ThemeToggler from "../components/ThemeToggler";
import ConfirmDeleteModalForCard from './../components/ConfirmDeleteModalForCard';
import { UserContext } from './../context/UserContext';
// let oldContent:string //this  works
type ContentType={
  title:string,
  note:string,
  _id:string,
  
}

type ContentTypeForEdit= ContentType & {
  cardIndex:number | null
}

type ContentForFullScreen=ContentType & {
  cardIndex:number | null
}

type PayloadType={
  deck_id:string,
  content:ContentType
  
}
type PropType={
  indexOfCardForDeletion:number | null,
  setIndexOfCardForDeletion:Dispatch<React.SetStateAction<number | null>>
}
function Cards({indexOfCardForDeletion,setIndexOfCardForDeletion}:PropType) {
  const {setAlert}=useContext(AlertContext) 
  const [note, setNote] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [openModal,setOpenModal]=useState(false)
  const [showFullScreen,setShowFullScreen]=useState(false)

  const {deleteConfirmationModalForCard}=useContext(UserContext)
  const changeColorWhileDragging=useRef<HTMLDivElement | null >(null)
  const showPopUp=useRef<HTMLDivElement | null >(null)
  const { deck_id } = useParams();
  const [fullScreenCardData,setFullScreenCardData]=useState<ContentForFullScreen>({title:"",note:"",_id:"",cardIndex:null})
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
  const {data,isError,error,isLoading}=useGetCards( deck_id!)
  const [editContent,setEditContent]=useState<ContentTypeForEdit>({title:"",note:"",_id:"",cardIndex:null})
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
    setAlert((preval:AlertData) => (
      {
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!"
      }))


  }
 
  };


  const handleDelete = async (index:number) => {
    setIndexOfCardForDeletion(index)
    if(deleteConfirmationModalForCard?.current?.classList.contains("hidden")){
      deleteConfirmationModalForCard?.current?.classList.remove("hidden")
 }     

  };



 const handleEdit = (cardItem:ContentTypeForEdit)=>{

  setEditContent(cardItem)
  setOpenModal(true)
 }

 const handleSave =()=>{
  let data={
    deck_id:deck_id!,
    newContent:editContent,
    index:editContent.cardIndex!
  }
if(editContent.title.length>0 || editContent.note.length>0 ){
  
    editCard(data)
    setOpenModal(false)
    setFullScreenCardData({...editContent})
  
}
else{
  setAlert((preval:AlertData) => (
    {
      ...preval,
      severity: "warning",
      show: true,
      message: "Title or note should contain one or more characters!"
    }))
}
 
 }

//  const getUserConfirmation=(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>)=>{
//   const payload={deck_id:deck_id!,index:indexOfCardForDeletion!}
  

//   if((e.target as HTMLButtonElement).id==="yesbutton"){
//     deleteCardItem(payload)
//     deleteConfirmationModalForCard?.current?.classList.add("hidden")
//   }
//   else{
//     deleteConfirmationModalForCard?.current?.classList.add("hidden")
//   }
//     }
      

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

 const handleShowFullScreen=(card:ContentForFullScreen)=>{
  setShowFullScreen(true)
  setFullScreenCardData({...card})
 }
  
 if(isLoading){
  return <Loading/>
}

if(isError){
  return  <div className=" absolute top-0 left-0  w-full h-full flex items-center justify-center text-gray-800 dark:text-gray-50 "><p className="font-semibold"><span className="font-bold">Error </span>: {(error as Error)?.message}</p></div>
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
              return    <div className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${snapshot.isDraggingOver? "ring-1 ring-red-500 shadow-md shadow-red-500":"ring-1 dark:ring-sky-500/40 ring-teal-500/40"}`}ref={provided.innerRef} {...provided.droppableProps}>
              <span  className={`lg:text-3xl text-2xl cursor-pointer text-teal-600 dark:text-sky-400  ${snapshot.isDraggingOver? "rotate-[30deg] text-red-500 dark:text-red-500":"transform-none"}  `}><BsTrash onClick={handlePopUp} title="Drag and drop the card here to delete it."/></span>
             </div>
            }
          }
    
       </Droppable>
       
    <div className="flex flex-col gap-2 w-full  relative overflow-auto h-screen ">
    


      <div className="w-full px-4 mt-6 mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
            Card details
          </label>
          <div className="flex flex-col ">
          <input type="text"   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
            }}  value={title}  className=" lg:w-[35rem] md:w-96 bg-white w-80 border-t-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-t-md font-semibold outline-none text-md text-gray-800 px-3 py-2 dark:bg-slate-900 dark:text-gray-50 pb-2" placeholder="Title" />
          <textarea 
            className=" lg:w-[35rem] md:w-96 bg-white w-80 border-b-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 text-md py-2 dark:bg-slate-900 dark:text-gray-50 resize-y "
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
      <Droppable droppableId="cardDropableArea"  >
          {
            (provided,snapshot)=>{
     return <div className="flex flex-row flex-wrap gap-4 justify-center items-center  mx-2 lg:mx-52 mb-48  " ref={provided.innerRef} {...provided.droppableProps}>
        
          {data?.cards?.map((card,index) => {
            return (
              <Draggable draggableId={`${deck_id!}-${index}`} index={index} key={index}  >
  
              {(provided,snapshot)=>{
               if(snapshot.isDragging){
                changeColorWhileDragging.current?.classList.add("!lg:w-[90vw]")
               }
             return <div  ref={provided.innerRef}  
              {...provided.dragHandleProps}  
              {...provided.draggableProps} 
                
                           key={index}
              >
                <div ref={changeColorWhileDragging} onClick={()=>handleShowFullScreen({...card,_id:deck_id!,cardIndex:index})}  className={`relative border   ${snapshot.isDragging ? "shadow-2xl  shadow-violet-600 border-violet-600  animate-pulse dark:bg-slate-900 bg-white": "border-gray-400 "} ${snapshot.draggingOver==="cardDeleteArea"?"shadow-2xl !shadow-red-500 !border-red-500 !bg-transparent":null}   flex flex-col text-gray-800
                rounded-md px-2 py-4  h-[9rem] lg:h-44  text-justify lg:w-[30vw] w-[95vw] `}>
                   <div className="absolute bottom-0 right-0">
{/* If I don't use event.stopPropagation() then when I click on delete button or edit button it will first use the onClick that is added on parent i.e div onClick={()=>handleShowFullScreen({...card,_id:deck_id!})} then it will use the onClick that is defined on buttons. which is a problem in this case to avoid that I have used event.stopPropagation() */}
 <button onClick={(event)=>{ event.stopPropagation(),handleDelete(index)}} type="button" className="text-red-500 text-lg outline-none  rounded-tr  px-1  text-center hover:scale-95"><MdOutlineDeleteOutline/></button>

 <button onClick={(event)=>{event.stopPropagation(),handleEdit({...card,_id:deck_id!,cardIndex:index})}} type="button" className="text-blue-500 text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 dark:text-sky-400"><BiEdit/></button>


 </div>
  <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1">{card.title}</p>
 <p className="text-sm lg:text-base text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1 " >{card.note}</p>
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
   
{ openModal?<div className="w-screen h-screen z-[60]  backdrop-blur-md lg:backdrop-blur-lg fixed inset-0 flex items-center justify-center ">
 <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-2 w-[98%] lg:w-1/3 dark:shadow-sm dark:shadow-slate-500">
 
  {/* modal head  */}
  <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
   <h2 className="py-2 px-4 text-left text-white font-bold ">Edit Card</h2>
  </div>
  {/* modal content  */}
  <div className=" px-2 lg:px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50">
  <input value={editContent.title} onChange={handleChange} name="title" className="px-2 py-2 w-full outline-none rounded-t-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 " placeholder="Title" />
   <textarea value={editContent.note} onChange={handleChange} name="note" className="px-2 py-2 w-full outline-none text-gray-800 rounded-b-md  dark:bg-slate-800 dark:text-gray-50 h-[60vh] resize-none"  placeholder="Note"></textarea>
  </div>

 
  {/* modal footer  */}
  <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
<button onClick={handleSave} className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4">Save</button>
<button onClick={()=>{setOpenModal(false)}} className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white">Cancel</button>
  </div>
</div>

 </div>:null}

<ConfirmDeleteModalForCard deck_id={deck_id} indexOfCardForDeletion={indexOfCardForDeletion} deleteCardItem={deleteCardItem} reference={deleteConfirmationModalForCard}/>

{showFullScreen&&<div className="fixed inset-0 overflow-y-auto bg-white text-gray-800 dark:bg-slate-900 dark:text-gray-50 p-4 lg:px-96 flex  flex-col z-50 items-center   ">
  <div className="mt-2 lg:mt-4 relative">
    <div className="mt-12">
      {/* here I have used tailwind's -ml-1 class to reduce the gap between the words that causes when you try to add very long words. */}
      {/* whitespace-pre-line to keep the new lines and spaces as it is */}
<p className="text-justify mb-5 mt-5 font-bold break-words break-normal -ml-1 whitespace-pre-line">{fullScreenCardData?.title}</p>
<p className="text-justify  mb-10 break-words break-normal -ml-1 whitespace-pre-line">{fullScreenCardData?.note}</p>
</div>
<div className="fixed top-0 py-4 dark:bg-slate-900 border-b dark:border-gray-300/10 border-gray-800/10 bg-white px-4 left-0 w-full flex items-center justify-between lg:px-96">
  <div>
<button onClick={()=>setShowFullScreen(false)} className=' text-xl rounded px-1 text-center text-gray-50 cursor-pointer bg-red-500'><IoIosArrowRoundBack/></button>
</div>
              <div className="flex items-center justify-center gap-2 ">
             <div className=""><ThemeToggler/></div>

 <button onClick={()=>{ handleDelete(fullScreenCardData?.cardIndex!)}} type="button" className="text-red-500 text-xl outline-none  rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handleEdit(fullScreenCardData)}} type="button" className="text-blue-500 text-xl outline-none  rounded-tr px-1  text-center hover:scale-105 dark:text-sky-400"><BiEdit/></button>


 </div>
 </div>
</div>
</div>}
</>
  );
}

export default Cards;
