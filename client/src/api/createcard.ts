
type PayloadData={
  deck_id:string,
  content:string
}
import { request } from './../utils/axios-utils';
// const createCard = async (id:string,content:string)=> {const response = await fetch(`http://localhost:5000/deck/${id}/card`, {
//     method: "POST",
//     body: JSON.stringify({ content }),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
  
// return response.json()
// }

// export default createCard


 const createCard=async(content:PayloadData)=>{
     const data =await  request.post(`${import.meta.env.VITE_APP_API_URL}/deck/${content.deck_id}/card`,{content:content.content})
      return data.data
}

export default createCard
