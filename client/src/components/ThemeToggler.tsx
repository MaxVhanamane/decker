import React,{useContext,FC} from 'react'
import {RiMoonClearFill} from "react-icons/ri"
import {RiSunFill} from "react-icons/ri"
import { UserContext } from '../context/UserContext'


const ThemeToggler:FC = () => {
  const {theme,setTheme}=useContext(UserContext)

  const handleClick=()=>{
    localStorage.setItem("theme",theme==="dark"?"light":"dark")
    setTheme(theme==="dark"?"light":"dark")
  }
  return (<>
    {theme?<div >
  { theme==="light"? <RiMoonClearFill onClick={handleClick} className='text-gray-500 text-2xl cursor-pointer'/>:
    <RiSunFill onClick={handleClick} className='text-sky-400 cursor-pointer'/>}
  </div>:null}</>
  ) 
}

export default ThemeToggler

