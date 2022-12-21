import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { UserContext } from '../context/context';
import {TiTick} from"react-icons/ti"
import { request } from '../utils/axios-utils';
import { userData } from '../types/types';
export default function AuthSuccess() {
    const navigate=useNavigate()
    const getUser=async():Promise<userData> =>{
      const data = await request.get("/getuser");
      localStorage.setItem("userInfo",JSON.stringify(data.data))
      const newD=localStorage.getItem("userInfo")
      let user
      if(newD){
        user= JSON.parse(newD)
      }
      return user
    }
  useEffect(()=>{
    (async()=>{

      const userInfo=await  getUser()
       if(userInfo?.email){
         setTimeout(()=>{
             navigate("/")
         },2000)
     }
    else{
     navigate("/login")
    }
    } )()
   
   
  },[])
  return (
    <div className='w-full h-screen flex items-center justify-center flex-col gap-3'>
      <div className='flex items-center justify-center rounded-full bg-green-700 text-white '><p className='text-4xl'><TiTick/></p></div>
        <div className=' text-gray-800 p-4 rounded-lg dark:text-gray-50'>
      <p className='text-xl font-bold'>Logged In successfully</p>
        </div>
      <p className='text-xs font-semibold text-gray-600 dark:text-gray-300'>Redirecting to the home page......</p>
    </div>
  )
}
