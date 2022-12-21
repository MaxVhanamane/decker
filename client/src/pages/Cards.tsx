import { ChangeEvent, FormEvent, useState } from "react";
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
import { type } from "os";
// let oldContent:string //this  works
type ContentType={
  title:string,
  note:string
}
type OldContent={
  oldContent:ContentType,
  index:number 
}

type PayloadType={
  deck_id:string,
  content:ContentType
  
}
function Cards() {
  const [note, setNote] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [oldContentData, setOldContentData] = useState<OldContent>({oldContent:{title:"",note:""},index:0});
  const [openModal,setOpenModal]=useState(false)
  const { deck_id } = useParams();
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
  const {data,isError,error,isLoading}=useGetCards( deck_id!)
  const [editContent,setEditContent]=useState<ContentType>({title:"",note:""})
   const {mutate:addCard,error:mutationError,isError:isMutationError}=useCreateCard()
   const {mutate:editCard,error:editMutationError,isError:isEditMutationError}=useEditCard()

   const {mutate:deleteCardItem,error:DeletemutationError,isError:isDeleteMutationError}=useDeleteCard()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(title.length>0){
    if(note.length>0){
   const content={title,note}
      const payload:PayloadType={deck_id:deck_id! ,content}
      addCard(payload)
      setNote("")
      setTitle("")
    }
    else{
      toast.info("Note must contain one or more characters.");
    }
  }
  else{
    toast.info("Title must contain one or more characters.");

  }
 
  };


  
  const handleDelete = (index:number) => {
    const payload={deck_id:deck_id!,index}
    deleteCardItem(payload)
  };



 const handleEdit = (cardItem:ContentType,index:number)=>{

  setOldContentData({...oldContentData,oldContent:cardItem,index:index}) // We will send this to backend to know which one we have to change.
  setEditContent(cardItem)
  setOpenModal(true)
 }

 const handleSave =()=>{
  let data={
    deck_id:deck_id!,
    oldContent:oldContentData,
    newContent:editContent
  }
if(editContent.title.length>0){
  if(editContent.note.length>0){
    editCard(data)
    setOpenModal(false)
  }
  else{
  toast.info("Note must contain one or more characters.");

  }
}
else{
  toast.info("Title must contain one or more characters.");
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

  
 if(isLoading){
  return <div className="flex justify-center items-center h-screen w-full bg-white dark:bg-slate-900"><img src={localStorage.getItem("theme")==="dark"?"/loading44.gif":"/loadinggif.gif"} alt="loading_image" width={200} height={200}/></div>
}

  if (isError) {
    return <span>Error: {(error as Error).message}</span>
  }
  // if(isMutationError){
  //   return <p>Error{(mutationError as Error)?.message}</p>
  // }
  return (
    <>
       <Droppable droppableId="cardDeleteArea">
          {
            (provided,snapshot)=>{
              return    <div className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-12 h-12 flex items-center justify-center`}ref={provided.innerRef} {...provided.droppableProps}>
              <span  className={`text-3xl text-teal-600 dark:text-sky-400  ${snapshot.isDraggingOver? "rotate-[30deg] text-red-500 dark:text-red-500":"transform-none"} `}><BsTrash title="Drag and drop the card item here for deletion."/></span>
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
                className={`relative   border   ${snapshot.isDragging ? "  border-cyan-500 animate-pulse shadow-sky-500  shadow-2xl    ": "border-gray-400 "} ${snapshot.draggingOver==="cardDeleteArea" &&"border-red-500 shadow-red-500  shadow-2xl "}   flex flex-col text-gray-800
                rounded-md min-w-[8rem] px-4 py-6 min-h-[5.5rem]   text-justify max-w-full break-all `}
                           key={index}
              >
                   <div className="absolute bottom-0 right-0">

 <button onClick={()=>{handleDelete(index)}} type="button" className="text-red-500 text-lg outline-none  rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handleEdit(card,index)}} type="button" className="text-blue-500 text-lg outline-none  rounded-tr px-1  text-center hover:scale-105 dark:text-sky-400"><BiEdit/></button>


 </div>
  <p className="font-bold text-lg text-gray-800 dark:text-gray-50 mb-1 p-1">{card.title}</p>
 <p className="text-base text-gray-800 dark:text-gray-100 p-1">{card.note}</p>
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
   
{ openModal?<div className="w-full h-screen bg-gray-200 dark:bg-slate-900 absolute inset-0 flex items-center justify-center ">
 <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/3">
 
  {/* modal head  */}
  <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
   <h2 className="py-2 px-4 text-left text-white font-bold ">Edit Card</h2>
  </div>
  {/* modal content  */}
  <div className=" px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50">
  <input value={editContent.title} onChange={handleChange} name="title" className="px-4 py-2 w-full outline-none rounded-t-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 " placeholder="Title" />
   <textarea value={editContent.note} onChange={handleChange} name="note" className="px-4 py-2 w-full outline-none text-gray-800 rounded-b-md resize-y dark:bg-slate-800 dark:text-gray-50" rows={8} placeholder="Note"></textarea>
  </div>

 
  {/* modal footer  */}
  <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
<button onClick={handleSave} className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4">Save</button>
<button onClick={()=>{setOpenModal(false)}} className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white">Cancel</button>
  </div>
</div>

 </div>:null}

</>
  );
}

export default Cards;
