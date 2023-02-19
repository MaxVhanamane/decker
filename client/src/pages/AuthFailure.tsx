import { useNavigate } from 'react-router-dom';
import { useContext,FC } from 'react';
import { UserContext } from '../context/UserContext';
import {RiCloseFill} from "react-icons/ri"
 const AuthSuccess: FC=()=> {
    const {userInfo}=useContext(UserContext) 
    const navigate=useNavigate()
    if(!userInfo){
        navigate("/login")

    }
 
  return (
    <>
    <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center dark:bg-[#0c1221] bg-white flex-col gap-4 -z-10 '>
      <div className='rounded-full bg-red-600'><p className='text-xl p-1 text-gray-50'><RiCloseFill/></p></div>
        <div className=' rounded-lg '>
      <p className='text-xl text-gray-800 font-bold mb-2 dark:text-gray-50'>Login failed</p>
      <p className='text-sm font-bold text-gray-600 dark:text-gray-400'> Please try again!</p>
        </div>
      <button onClick={()=>{navigate("/login")}} className="font-bold border-2 border-teal-600 mt-4 text-teal-800 px-2 py-1 rounded-lg hover:border-teal-500 dark:bg-transparent dark:hover:border-sky-400  dark:border-sky-500 dark:text-gray-50" aria-label="Go to Login Page">Go to Login Page</button>
    </div>
      </>
  )
}
export default AuthSuccess
