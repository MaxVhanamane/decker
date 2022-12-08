import { ChangeEvent, FormEvent, useState } from "react";
import {useParams} from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from './../hooks/useDeleteCard';
import { MdOutlineDeleteOutline, MdOutlineModeEdit } from 'react-icons/md';
import { BiEdit } from 'react-icons/bi';
import useEditCard from './../hooks/useEditCard';
import { toast } from 'react-toastify';
// let oldContent:string //this  works
type OldContent={
  oldContent:string,
  index:number 
}
function Cards() {
  const [content, setContent] = useState<string>("");
  const [oldContentData, setOldContentData] = useState<OldContent>({oldContent:"",index:0});
  const [openModal,setOpenModal]=useState(false)
  const { deck_id } = useParams();
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
  const {data,isError,error,isLoading}=useGetCards( deck_id!)
  const [editContent,setEditContent]=useState<string>("")
   const {mutate:addCard,error:mutationError,isError:isMutationError}=useCreateCard()
   const {mutate:editCard,error:editMutationError,isError:isEditMutationError}=useEditCard()

   const {mutate:deleteCardItem,error:DeletemutationError,isError:isDeleteMutationError}=useDeleteCard()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(content.length>0){

      const payload={deck_id:deck_id! ,content}
      addCard(payload)
      setContent("")
    }
    else{
      toast.info("Card details must contain one or more characters.");
    }
 
  };


  
  const handleDelete = (index:number) => {
    const payload={deck_id:deck_id!,index}
    deleteCardItem(payload)
  };



 const handleEdit = (cardItem:string,index:number)=>{

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

  editCard(data)
  setOpenModal(false)

 }

 const handleChange = (e:ChangeEvent<HTMLTextAreaElement>)=>{
  setEditContent(e.target.value)
 }

  if(isLoading){
    return <h1>Fetching cards....</h1>
  }

  if (isError) {
    return <span>Error: {(error as Error).message}</span>
  }
  // if(isMutationError){
  //   return <p>Error{(mutationError as Error)?.message}</p>
  // }
  return (
    <>
    <div className="flex flex-col gap-2 mt-6 w-full  relative ">
      <div className="w-full px-4 mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <label htmlFor="title" className=" font-bold text-gray-700">
            Card details
          </label>
          <textarea
            className=" resize-y lg:w-[35rem] md:w-96 w-80 border-2 border-[#459C98] outline-none focus:border-[#2e807b] text-gray-800 px-3 py-2 rounded-md"
            rows={2}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setContent(e.target.value);
            }}
            value={content}
          />
          <button className="bg-[#459C98] hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md ">Create Card</button>
        </form>
        <h1 className="font-bold text-xl text-gray-800 mb-6  mt-6">{data?.title} </h1>

      </div>

      <div className="flex flex-row flex-wrap gap-4 justify-center items-center mx-10 mb-16">
        
          {data?.cards?.map((card,index) => {
            return (
              <div
                className="relative shadow-lg  flex text-gray-800
                rounded-md w-fit px-10 py-8 h-fit text-justify my-auto max-w-full "
                           key={index}
              >
                   <div className="absolute bottom-0 right-0">

 <button onClick={()=>{handleDelete(index)}} type="button" className="text-red-500 text-lg outline-none  font-bold rounded-tr  px-1  text-center hover:scale-105"><MdOutlineDeleteOutline/></button>

 <button onClick={()=>{handleEdit(card,index)}} type="button" className="text-blue-500 text-lg outline-none  font-bold rounded-tr px-1  text-center hover:scale-105"><BiEdit/></button>


 </div> {card}
              </div>
            );
          })}
        </div>
    
  


    </div>
   
{ openModal?<div className="w-full h-screen bg-gray-200 absolute inset-0 flex items-center justify-center ">
 <div className=" bg-[#459C98]  flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/3">
 
  {/* modal head  */}
  <div className="w-full  border-b border-gray-50">
   <h2 className="py-2 px-4 text-left text-white">Edit Card</h2>
  </div>
  {/* modal content  */}
  <div className=" px-4 py-4 w-full border-b border-gray-50">
   <textarea value={editContent} onChange={handleChange} name="cardEdit" className="px-4 py-2 w-full focus:outline-1 focus:outline-gray-200 " rows={8}></textarea>
  </div>

 
  {/* modal footer  */}
  <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
<button onClick={handleSave} className="px-2 py-1 bg-blue-700 hover:bg-blue-800 rounded outline-none text-white mx-4">Save</button>
<button onClick={()=>{setOpenModal(false)}} className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white">Cancel</button>
  </div>
</div>

 </div>:null}

</>
  );
}

export default Cards;
