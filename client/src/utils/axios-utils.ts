import axios  from "axios";

export const request = axios.create({
    withCredentials:true,
    baseURL:`${import.meta.env.VITE_API_URL}`
})

