import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/context';
import {RiCloseFill} from "react-icons/ri"
export default function AuthSuccess() {
    const {userInfo}=useContext(UserContext) 
    const navigate=useNavigate()
    if(!userInfo){
        navigate("/login")

    }
 
  return (
    <>
    <div className='w-full h-screen flex items-center justify-center flex-col gap-4'>
      <div className='rounded-full bg-red-500'><p className='text-2xl p-1 text-gray-50'><RiCloseFill/></p></div>
        <div className=' rounded-lg'>
      <p className='text-xl text-gray-800 font-bold mb-2 dark:text-gray-50'>Login failed</p>
      <p className='text-sm font-bold text-gray-600 dark:text-gray-400'> Please try again!</p>
        </div>
      <button onClick={()=>{navigate("/login")}} className="font-bold border-2 border-teal-600 mt-4 text-teal-800 px-2 py-1 rounded-lg hover:border-teal-500 dark:bg-transparent dark:hover:border-sky-400  dark:border-sky-500 dark:text-gray-50">Go to Login Page</button>
    </div>
      </>
  )
}
