import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/context';
import {TiTick} from"react-icons/ti"
export default function AuthSuccess() {
    const {userInfo}=useContext(UserContext) 
    const navigate=useNavigate()
    if(userInfo){
        setTimeout(()=>{
            navigate("/")
        },2000)
    }
   else{
    navigate("/login")
   }
  return (
    <div className='w-full h-screen flex items-center justify-center flex-col gap-3'>
      <div className='flex items-center justify-center rounded-full bg-green-700 text-white '><p className='text-4xl'><TiTick/></p></div>
        <div className=' text-gray-800 p-4 rounded-lg'>
      <p className='text-xl font-bold'>Logged In successfully</p>
        </div>
      <p className='text-xs font-semibold text-gray-600'>Redirecting to the home page......</p>
    </div>
  )
}
