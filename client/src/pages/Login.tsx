import  { useState ,ChangeEvent,useContext,FormEvent, useEffect} from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/context';
import { request } from '../utils/axios-utils';
import {FcGoogle} from "react-icons/fc"
import { toast } from 'react-toastify';
import { FaFeatherAlt } from 'react-icons/fa';
export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const {userInfo}=useContext(UserContext) 
  const navigate=useNavigate()
  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
  
    if (e.target.name === "email") {
      setEmail(e.target.value)
    }
    else if (e.target.name === "password") {
      setPassword(e.target.value)
   
  }
}
useEffect(()=>{

if(userInfo?.email){
  navigate("/")
}
},[userInfo?.email])


const handleLogin = async (e:FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  
    const data = {  email, password };
     
    const response=await request.post("/login",data)
   if(response.data.success==true){
    const response=await request.get("/getuser")
    localStorage.setItem("userInfo",JSON.stringify(response.data))


  navigate("/auth/success")
   }
  else{
    toast.error("Invalid username or password", {
     
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
  

}


  const handleGoogleLogin = async () => {
    window.open(`${import.meta.env.VITE_APP_GOOGLE_AUTH_URL}`,"_self")

  }

  return (
    <>
    <section className="h-screen">
    <div className=" py-12 px-6 h-full">
      <div className="flex justify-center items-center flex-wrap h-full g-6 ">
        <div className="xl:w-6/12">
          <div className="block   rounded-lg shadow-2xl bg-white dark:bg-slate-900 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500 ">
            <div className="flex justify-center items-center g-0">
              <div className=" px-4 md:px-0">
                <div className="md:p-12 p-4 md:mx-6">
                  <div className="flex items-center justify-center flex-col rounded-full">
                  <span className='text-2xl text-teal-600 dark:text-sky-500'><FaFeatherAlt/></span>
                    <h2 className='font-bold text-2xl text-teal-600 dark:text-sky-500 '>Decker</h2>
                    <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">Log in to your account</h4>
                  </div>
                  <form onSubmit={handleLogin}>
                    {/* <p className="mb-4">Please login to your account</p> */}
                    <div className="mb-4">
                      <input 
                      onChange={handleChange}
                        type="email"
                        className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 dark:border-gray-300/40 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-700 focus:outline-none dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1"
                        id="email"
                        placeholder="Email"
                        name="email"
                      />
                    </div>
                    <div className="mb-4">
                      <input
                      onChange={handleChange}
                        type="password"
                        className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 dark:border-gray-300/40 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-700 focus:outline-none dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1"
                        id="password"
                        placeholder="Password"
                        name="password"
                      />
                    </div>
                    <div className="text-center pt-1  pb-1">
                    <button
                        className="  inline-block px-6 py-2.5 text-gray-800  font-medium text-xs leading-tight uppercase rounded  active:shadow-lg transition duration-150 ease-in-out w-full dark:text-gray-50 border border-gray-500 hover:border hover:border-teal-500 dark:hover:border-sky-500 dark:border-gray-100/80 "
      
                        data-mdb-ripple="true"
                        data-mdb-ripple-color="light"
                        type="submit"
                      
                      >
                        Log in
                      </button>
                      <div className="relative py-1">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-b border-gray-300 dark:border-gray-300/30"></div>
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white px-4 text-sm text-gray-500 dark:bg-slate-900">or</span>
  </div>
</div>
                      <button onClick={()=>handleGoogleLogin()}
                        className="  px-6 py-[0.35rem] text-gray-800 font-medium text-xs leading-tight uppercase rounded   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 flex items-center justify-center dark:text-gray-50 gap-4 border border-gray-500 dark:border-gray-100/80 hover:border hover:border-teal-500 dark:hover:border-sky-500"
      
                    
                        type="button"
                      
                      >
                       <span><FcGoogle className='text-2xl'/></span> <span> Log in with Google</span>
                      </button>
   


                      
                     {/* <Link to="/forgotpassword" className="text-gray-600 hover:text-gray-700" >Forgot password?</Link> */}
                    </div>
                    <div className="flex items-center justify-center gap-2 pb-6">
                      <p className=" text-gray-800 dark:text-gray-50">Don&apos;t have an account?</p>
                      <Link to="/signup"><p
                        className="  text-blue-600 font-medium text-xs uppercase dark:text-sky-500  "
                      
                      >
                        Sign Up
                      </p></Link>
                    </div>
                  </form>
                </div>
              </div>
       
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  </>
  )
}
