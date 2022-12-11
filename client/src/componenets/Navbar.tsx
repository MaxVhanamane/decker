import React ,{FC}from 'react'
import { Link } from 'react-router-dom';

const Navbar:FC = () => {
  return (
    <nav className='bg-[#459C98] p-2 flex flex-row gap-10 items-center sticky top-0 z-10'>
        <span className='block h-8 w-auto text-gray-900 px-2 rounded bg-gray-50 font-bold text-xl'>Decker</span>
      <ul className='flex gap-8 cursor-pointer'>
        <Link to="/"><li className='text-gray-50 font-bold'>Home</li></Link>
        <li className='text-gray-50 font-bold'>About</li>
        <Link to="/login"><li className='text-gray-50 font-bold'>Login</li></Link>
      </ul>
    </nav>
  )
}

export default Navbar
