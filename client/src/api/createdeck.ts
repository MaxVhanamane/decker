
// const createDeck = async (title:string)=> {const response = await fetch("http://localhost:5000/deck", {
//     method: "POST",
//     body: JSON.stringify({ title }),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

import { request } from "../utils/axios-utils";

  
// return response.json()
// }


const createDeck = async (title:string)=> {
  // you don't need to add try catch block as axios will automatically throw an error. 
  // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
    const response = await request.post("http://localhost:5000/deck", {title});
    return response.data

}

export default createDeck
