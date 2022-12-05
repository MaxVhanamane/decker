import { request } from "../utils/axios-utils";

type DataType = {
  id: string;
  pinned: boolean
}


const updateDeck = async (data: DataType) => {
  // you don't need to add try catch block as axios will automatically throw an error. 
  // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
  const response = await request.put(`${import.meta.env.VITE_APP_API_URL}/deck`, { id: data.id, pinned: data.pinned, });
  return response.data

}

export default updateDeck
