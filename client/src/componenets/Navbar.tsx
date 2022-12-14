import {FC}from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { request } from './../utils/axios-utils';
import { useContext } from 'react';
import { UserContext } from './../context/context';

const Navbar:FC = () => {
  const {userInfo,setUserInfo}=useContext(UserContext)
  const navigate = useNavigate();
  const handleLogout =async()=>{
  const res= await request.post("/auth/logout")
  
   if(res.data==="done"){
   setUserInfo(null)
   localStorage.removeItem('userInfo')
    navigate('/login',{ replace: true})
   }
  }
  return (
    <nav className='bg-[#459C98] p-2 flex flex-row gap-10 items-center sticky top-0 z-10'>
        <span className='block h-8 w-auto text-gray-900 px-2 rounded bg-gray-50 font-bold text-xl'>Decker</span>
      <ul className='flex gap-8 cursor-pointer'>
        {userInfo?.email?<Link to="/"><li className='text-gray-50 font-bold'>Home</li></Link>:null}
       {!userInfo?.email? <Link to="/login"><li className='text-gray-50 font-bold'>Login</li></Link>
        :<li onClick={()=>{handleLogout()}}className='text-gray-50 font-bold'>Logout</li>}
      </ul>
    </nav>
  )
}

export default Navbar
