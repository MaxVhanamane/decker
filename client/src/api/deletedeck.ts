
// export const deleteDeck = async (id:string)=>{
//     const response = await fetch(`http://localhost:5000/deck/${id}`, {
//         method: "DELETE",
      
//       });
//       return response.json()
// }

import { request } from "../utils/axios-utils";




const  deleteDeck = async (id:string)=> {
  try{
    const response = await request.delete(`${import.meta.env.VITE_APP_API_URL }/deck/${id}`);
    return response.data
  }
  
 catch(error){
  return error
 }

}

export default deleteDeck
