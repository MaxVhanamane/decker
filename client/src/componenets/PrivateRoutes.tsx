import {Outlet,Navigate} from 'react-router-dom'
export default function ProtectedRoutes() {
   //  const {userInfo}=useContext(UserContext) 
   const userFromLocalStorage=localStorage.getItem("userInfo")
  const userInfo=userFromLocalStorage?JSON.parse(userFromLocalStorage):null

  return (
  <>
  {/* if user is logged in then we will give access to all the protected routes else will send him to login page  */}
     { userInfo ? <Outlet/>:<Navigate to="/login"/>}
  </>
  )
}

