import SessionExpired from '../components/SessionExpired'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionExpiredPage = () => {
  const navigate=useNavigate()

  useEffect(()=>{
    let getUser=localStorage.getItem("userInfo")
    let userInfo
  if(getUser){
     userInfo=JSON.parse(getUser)
  }
  if(userInfo?.email){
    navigate("/")
  }
  },[])
  return (
    localStorage.getItem("userInfo")===null? <SessionExpired/> : null
  )
}

export default SessionExpiredPage
