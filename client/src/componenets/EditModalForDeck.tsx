import { useState } from 'react';
import useEditDeck from './../hooks/useEditDeck';

const EditModalForDeck=({openEditDeckModal,setOpenEditDeckModal,editData,setEditData}:any)=> {
    const [newTitle,setNewTitle]=useState(editData.title)
    const{mutate:editDeck,isError:isEditError}=useEditDeck()
    const handleSave=()=>{
        const data={deck_id:editData.deck_id,newTitle}
        editDeck(data)
        setOpenEditDeckModal(false);
        setEditData({});  
    }
   
    
  return (
    <>
    { openEditDeckModal?<div className="w-full h-screen  backdrop-blur-xl  fixed inset-0 flex items-center justify-center z-[990]">
 <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/3">
 
  {/* modal head  */}
  <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
   <h2 className="py-2 px-4 text-left text-white font-bold ">Edit Deck</h2>
  </div>
  {/* modal content  */}
  <div className=" px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50">
  <input value={newTitle} onChange={(e)=>{setNewTitle(e.target.value)}} name="title" className="px-4 py-2 w-full outline-none rounded-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 " placeholder="Title" />
 
  </div>

 
  {/* modal footer  */}
  <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
<button onClick={handleSave} className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4">Save</button>
<button onClick={()=>{setOpenEditDeckModal(false)}} className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white">Cancel</button>
  </div>
</div>

 </div>:null}
    </>
  )
}

export default EditModalForDeck
