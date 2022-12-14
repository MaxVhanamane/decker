import {FC}from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { request } from './../utils/axios-utils';
import { useContext } from 'react';
import { UserContext } from './../context/context';
import {RxHamburgerMenu} from 'react-icons/rx';

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
    <>
    <nav className='bg-[#459C98] p-2 flex flex-row  justify-between items-center sticky top-0 z-10 '>
      <div className='flex items-center justify-center flex-row gap-8'>
        <span className='block h-8 w-auto text-gray-900 px-2 rounded bg-gray-50 font-bold text-xl'>Decker</span>
 
      </div>
  <div>
  <ul className='flex gap-10 cursor-pointer items-center justify-center'>
        {userInfo?.email?<Link to="/"><li className='text-gray-50 hover:text-gray-100 font-semibold'>Home</li></Link>:null}
       {!userInfo?.email? <Link to="/login"><li className='text-gray-50 hover:text-gray-100 font-semibold mr-4'>Login</li></Link>
        :<li onClick={()=>{handleLogout()}}className='text-gray-50 hover:text-gray-100 font-semibold mr-4'>Logout</li>}
      </ul>
  </div>

      {/* <div className='flex items-center justify-center text-xl '>
      <span className='text-white'><RxHamburgerMenu/></span>
   
      </div> */}
    </nav>
    {/* <div className='mt-4 flex absolute right-0 top-7 bg-gray-200  w-[6rem]'>
         <ul className='flex gap-2 cursor-pointer flex-col '>
        {userInfo?.email?<Link to="/"><li className='text-gray-800  '>Home</li></Link>:null}
       {!userInfo?.email? <Link to="/login"><li className='text-gray-800 '>Login</li></Link>
        :<li onClick={()=>{handleLogout()}}className='text-gray-800 '>Logout</li>}
      </ul>
    </div> */}
    </>
  )
}

export default Navbar
