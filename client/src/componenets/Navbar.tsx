import {FC}from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { request } from './../utils/axios-utils';
import { useContext, useRef } from 'react';
import { UserContext } from './../context/context';
import {FaFeatherAlt} from 'react-icons/fa';
import { userData } from '../types/types';
import {FaUserCircle} from "react-icons/fa"
import {RiCloseFill} from "react-icons/ri"
import { useState } from 'react';
import { useEffect } from 'react';
import ThemeToggler from './ThemeToggler';
const Navbar:FC = () => {
  const {setUserInfo}=useContext(UserContext)
  const userDetails=localStorage.getItem("userInfo")
  // const [showInfo,setShowInfo]=useState(false)
  let userInfo:userData | undefined
  const divRef=useRef<HTMLDivElement | null >(null)
  const divRefForLargeScreen=useRef<HTMLDivElement | null >(null)
  if(userDetails){
    userInfo=JSON.parse(userDetails)
  }
  const navigate = useNavigate();
  const location=useLocation()
  const handleShowUserInfomation=()=>{
    if(divRef.current?.classList.contains("hidden")){
      divRef.current.classList.remove("hidden")
    }
    else{
      divRef.current?.classList.add("hidden")

    }
    if(divRefForLargeScreen.current?.classList.contains("lg:hidden")){
      divRefForLargeScreen.current.classList.remove("lg:hidden")
      divRefForLargeScreen.current?.classList.add("lg:block")
    }
    else{
      divRefForLargeScreen.current?.classList.remove("lg:block")
      divRefForLargeScreen.current?.classList.add("lg:hidden")

    }

  }


  const handleLogout =async()=>{
  const res= await request.post("/auth/logout")
   if(res.data==="done"){
   setUserInfo(null)
   handleShowUserInfomation()
   localStorage.removeItem('userInfo')
    navigate('/login',{ replace: true})
   }
  }
  return (
    <>
    <nav className='border-b bg-white border-slate-900/10 dark:bg-slate-900 dark:border-b dark:border-slate-300/10 p-2 dark:py-3 py-3 flex flex-row justify-between items-center sticky top-0 z-10 '>
   

      <div className='flex items-center justify-center flex-row gap-8'>
      <div className='flex items-center justify-center rounded px-2 gap-2'>
      <span className='text-xl text-teal-600 dark:text-sky-400'><FaFeatherAlt/></span> <span className=' h-8 w-auto text-gray-700 dark:text-sky-50 font-bold text-xl   '>Decker</span>
 
      </div>
  <div className='hidden md:block'>
  <ul className='flex gap-10  items-center justify-center'>
        {(userInfo?.email && location.pathname.split("/")[1]=="cards")?<Link to="/"><li className='dark:text-gray-50 text-gray-800 cursor-pointer dark:hover:text-sky-500 hover:text-gray-600 font-semibold '>Home</li></Link>:null}
    
      </ul>
  </div>
  </div>
  <div >
    <ul className='flex items-center justify-center gap-3'>
  <li className=' text-2xl mr-2 '> <ThemeToggler /></li>

  {userInfo?.email?<li onClick={()=>{handleShowUserInfomation()}}className=' cursor-pointer   mr-1  rounded-full flex gap-2 px-2 items-center'> {userInfo?.profile_picture?<img className='rounded-full w-8 h-8 ' src={userInfo?.profile_picture} alt="profile" referrerPolicy="no-referrer"/>:<FaUserCircle className='w-8 h-8 dark:text-sky-500 text-gray-600 '/>}</li>:null}
        </ul>
  </div>

      {/* <div className='flex items-center justify-center text-xl '>
      <span className='text-white'><RxHamburgerMenu/></span>
   
      </div> */}
    </nav>

    <div ref={divRefForLargeScreen}  className='mt-16 fixed top-4 hidden lg:hidden right-6 bg-white dark:bg-slate-900 mx-auto w-fit border dark:border-slate-300/10 z-50  px-5 py-2 pb-4 rounded '>
<button onClick={handleShowUserInfomation} className='font-semibold absolute top-2 right-1 rounded px-1 text-center text-gray-50 cursor-pointer '><RiCloseFill/></button>
    <h2 className='mb-3 font-bold text-gray-700 dark:text-gray-50'>My account</h2>
      <ul className='flex flex-col items-start gap-2 text-gray-700 dark:text-gray-50 '>
        <li><span className='font-semibold '>username:</span> {userInfo?.username}</li>
        <li><span className='font-semibold '>email:</span> {userInfo?.email}</li>
        
      </ul>
      <div className='flex items-center justify-center gap-4'>
      {(userInfo?.email && location.pathname.split("/")[1]=="cards")?<Link to="/"><button onClick={handleShowUserInfomation} className=' md:hidden font-semibold  rounded px-1 text-center text-white cursor-pointer hover:bg-teal-700 mt-4 '>Home</button></Link>:null}
      <button onClick={()=>{handleLogout()}} className='font-semibold  rounded px-1 text-center text-red-600 cursor-pointer  mt-4'>Logout</button>
      
   
      </div>
    </div>



    <div ref={divRef} className='hidden fixed z-50 inset-0  lg:hidden '>
<div className='fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-slate-900/80 '>
<div  className='mt-16 relative bg-white dark:bg-slate-900 mx-auto w-fit border  shadow ring-1 ring-slate-900/5   dark:border-slate-300/10 z-50  px-5 py-2 pb-4 rounded '>
<button onClick={handleShowUserInfomation} className='font-semibold absolute top-2 right-1 rounded px-1 text-center dark:text-gray-50  text-gray-800 cursor-pointer '><RiCloseFill/></button>
    <h2 className='mb-3 font-bold text-gray-700 dark:text-gray-50'>My account</h2>
      <ul className='flex flex-col items-start gap-2 text-gray-700 dark:text-gray-50 '>
        <li><span className='font-semibold '>username:</span> {userInfo?.username}</li>
        <li><span className='font-semibold '>email:</span> {userInfo?.email}</li>
        
      </ul>
      <div className='flex items-center justify-center gap-4'>
      {(userInfo?.email && location.pathname.split("/")[1]=="cards")?<Link to="/"><button onClick={handleShowUserInfomation} className=' md:hidden font-semibold  rounded px-1 text-center text-white cursor-pointer hover:bg-teal-700 mt-4 '>Home</button></Link>:null}
      <button onClick={()=>{handleLogout()}} className='font-semibold  rounded px-1 text-center text-red-600 cursor-pointer  mt-4'>Logout</button>
      
   
      </div>
    </div>
</div>
    </div>
    </>
  )
}

export default Navbar
