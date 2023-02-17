import {FC,useState}from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { request } from '../utils/axios-utils';
import { useContext, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import {FaFeatherAlt} from 'react-icons/fa';
import { userData } from '../types/types';
import {FaUserCircle} from "react-icons/fa"
import {RiCloseFill} from "react-icons/ri"
import ThemeToggler from './ThemeToggler';
import SearchBar from './SearchBar';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
const Navbar:FC = () => {
  const {setUserInfo,showSearchBar,setShowSearchBar}=useContext(UserContext)
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



    if(divRefForLargeScreen.current?.classList.contains("scale-0")){
       divRefForLargeScreen.current?.classList.add("!block")
      divRefForLargeScreen.current?.classList.remove("scale-0")
      divRefForLargeScreen.current?.classList.add("scale-100")
      

    }
    else{
      divRefForLargeScreen.current?.classList.remove("scale-100")
      divRefForLargeScreen.current?.classList.add("scale-0")
      divRefForLargeScreen.current?.classList.add("hidden")

      // divRefForLargeScreen.current?.classList.add("md:block")


    }


  }


  const handleLogout =async()=>{
  const res= await request.post("/auth/logout")
   if(res.data==="done"){
     handleShowUserInfomation()
   setUserInfo(null)
   localStorage.removeItem('userInfo')
    navigate('/login',{ replace: true})
   }
  }
  return (
    <>
    <nav className='border-b bg-white border-slate-900/10 dark:bg-slate-900 dark:border-b dark:border-slate-300/10 px-2  py-2 flex flex-row justify-between items-center sticky top-0 z-[60] '>
   

      <div className='flex items-center justify-center flex-row gap-8'>
      <Link to={"/"}><div className='flex items-center justify-center rounded px-2 gap-2'>
      <span className='text-xl text-teal-600 dark:text-sky-400'><FaFeatherAlt/></span> <span className=' h-8 w-auto text-gray-700 dark:text-sky-50 font-bold text-xl   '>Decker</span>
 
      </div></Link>
  <div className='hidden md:block'>
  <ul className='flex gap-10  items-center justify-center'>
        {(userInfo?.email && location.pathname.split("/")[1]=="cards")?<Link to="/"><li className='dark:text-gray-50 text-gray-800 cursor-pointer dark:hover:text-sky-500 hover:text-gray-600 font-semibold transition-[color] duration-300 '>Home</li></Link>:null}
    
      </ul>
  </div>
  </div>
  
  <div className='flex gap-4 items-center justify-center ' >
  <SearchBar />
   <button onClick={()=>{setShowSearchBar(true)}} disabled={showSearchBar}>
    <BsSearch className={`text-lg dark:text-gray-100 text-gray-500 ${!showSearchBar?"opacity-100":"opacity-0 pointer-events-none"} cursor-pointer transition-opacity lg:duration-[1200ms] duration-500 mr-2`} />
    </button>
<div>




    <ul className='flex items-center justify-center gap-3'>
  <li className=' text-2xl mr-2 '> <ThemeToggler /></li>

  {userInfo?.email?<li onClick={()=>{handleShowUserInfomation()}}className=' cursor-pointer   mr-1  rounded-full flex gap-2 px-2 items-center'> {userInfo?.profile_picture?<img className='rounded-full w-8 h-8 ' src={userInfo?.profile_picture} alt="profile" referrerPolicy="no-referrer"/>:<FaUserCircle className='w-8 h-8 dark:text-sky-500 text-gray-600 '/>}</li>:null}
        </ul>
        </div>
  </div>

      {/* <div className='flex items-center justify-center text-xl '>
      <span className='text-white'><RxHamburgerMenu/></span>
   
      </div> */}
    </nav>
   
    <div ref={divRefForLargeScreen}  className=' fixed transition duration-500 ease-in-out scale-0  right-6   px-5 py-2 pb-4  z-50 '>
      <div className=' ring-1 dark:ring-sky-500 ring-teal-500 absolute right-4 top-4   bg-white p-4 rounded-md dark:bg-slate-900 mx-auto  '>
<button onClick={handleShowUserInfomation} className='font-semibold absolute top-2 right-1 rounded px-1 text-center text-gray-50 cursor-pointer ' aria-label="Close"><RiCloseFill/></button>
    <h2 className='mb-3 font-bold text-gray-700 dark:text-gray-50'>My account</h2>
      <ul className='flex flex-col items-start gap-2 text-gray-700 dark:text-gray-50 w-fit '>
        <li className='flex gap-1'><span className='font-semibold  w-fit'>username:</span> {userInfo?.username}</li>
        <li className='flex gap-1'><span className='font-semibold  w-fit'>email:</span> {userInfo?.email}</li>
        
      </ul>
      <div className='flex items-center justify-center gap-4 '>
      {(userInfo?.email && location.pathname.split("/")[1]=="cards")?<Link to="/"><button onClick={handleShowUserInfomation} className=' md:hidden font-semibold  rounded px-1 text-center text-white cursor-pointer mt-4 ' aria-label="Home" >Home</button></Link>:null}
      <button onClick={()=>{handleLogout()}} className='font-semibold  rounded px-1 text-center text-red-600 hover:text-red-700 transition-[color] duration-300 cursor-pointer  mt-4' aria-label="Logout">Logout</button>
      
   
      </div>
      </div>
    </div>
    </>
  )
}

export default Navbar
