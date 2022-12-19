import {FC}from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { request } from './../utils/axios-utils';
import { useContext, useRef } from 'react';
import { UserContext } from './../context/context';
import {FaFeatherAlt} from 'react-icons/fa';
import { userData } from '../types/types';
import {FaUserCircle} from "react-icons/fa"
import { useState } from 'react';
const Navbar:FC = () => {
  const {setUserInfo}=useContext(UserContext)
  const userDetails=localStorage.getItem("userInfo")
  // const [showInfo,setShowInfo]=useState(false)
  let userInfo:userData | undefined
  const divRef=useRef<HTMLDivElement | null >(null)
  if(userDetails){
    userInfo=JSON.parse(userDetails)
  }
  const navigate = useNavigate();

  const handleShowUserInfomation=()=>{
    if(divRef.current?.classList.contains("hidden")){
      divRef.current.classList.remove("hidden")
    }
    else{
      divRef.current?.classList.add("hidden")

    }

  }

  const handleLogout =async()=>{
  const res= await request.post("/auth/logout")
   if(res.data==="done"){
   setUserInfo(null)
   handleShowUserInfomation()
   localStorage.removeItem('userInfo')
  //  setShowInfo(!showInfo)
    navigate('/login',{ replace: true})
   }
  }
  return (
    <>
    <nav className='bg-[#459C98] p-2 flex flex-row justify-between items-center sticky top-0 z-10 '>
      <div className='flex items-center justify-center flex-row gap-8'>
      <div className='flex items-center justify-center bg-gray-50 rounded  px-2 gap-2'>
      <span className='text-xl text-teal-600'><FaFeatherAlt/></span> <span className=' h-8 w-auto text-gray-700 font-bold text-xl   '>Decker</span>
 
      </div>
  <div className='hidden md:block'>
  <ul className='flex gap-10  items-center justify-center'>
        {userInfo?.email?<Link to="/"><li className='text-gray-50 cursor-pointer hover:text-gray-100 font-semibold '>Home</li></Link>:null}
    
      </ul>
  </div>
  </div>
  <div >
    <ul>
  {!userInfo?.email? <Link to="/login"><li className='text-gray-50 cursor-pointer hover:text-gray-100 font-semibold mr-4'>Login</li></Link>
        :<li onClick={()=>{handleShowUserInfomation()}}className='text-gray-50 cursor-pointer hover:text-gray-100  mr-1  rounded-full flex gap-2 px-2 items-center'> {userInfo?.profile_picture?<img className='rounded-full w-8 h-8 ' src={userInfo?.profile_picture} alt="profile" referrerPolicy="no-referrer"/>:<FaUserCircle className='w-8 h-8'/>}</li>}
        </ul>
  </div>

      {/* <div className='flex items-center justify-center text-xl '>
      <span className='text-white'><RxHamburgerMenu/></span>
   
      </div> */}
    </nav>
  <div ref={divRef} className='mt-4 hidden bg-gray-50  fixed right-0 top-9 w-fit shadow-lg z-50  px-5 py-2 pb-4 rounded-b'>
    <h2 className='mb-3 font-bold text-gray-800'>My account</h2>
      <ul className='flex flex-col items-start gap-2 '>
        <li><span className='font-semibold text-gray-700'>username:</span> {userInfo?.username}</li>
        <li><span className='font-semibold text-gray-700'>email:</span> {userInfo?.email}</li>
        
      </ul>
      <div className='flex items-center justify-center gap-4'>
      {userInfo?.email?<Link to="/"><button className=' md:hidden font-bold bg-teal-600 rounded px-1 text-center text-white cursor-pointer hover:bg-teal-700 mt-4 '>Home</button></Link>:null}
      <button onClick={()=>{handleLogout()}} className='font-bold bg-red-500 rounded px-1 text-center text-white cursor-pointer hover:bg-red-600  mt-4'>Logout</button></div>
    </div>
    </>
  )
}

export default Navbar
