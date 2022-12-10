import React, { useState,useEffect ,ChangeEvent} from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { request } from './../utils/axios-utils';


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  useEffect(()=>{
 const token=localStorage.getItem("token")

  },[])
  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
  
    if (e.target.name === "email") {
      setEmail(e.target.value)
    }
    else if (e.target.name === "password") {
      setPassword(e.target.value)
   
  }
}

  const handleLogin = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
      const data = {  email, password };
       console.log(data)
      request.post("/login",data, { withCredentials: true })
//       const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/login`, {
//         method: 'POST', // or 'PUT'
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })
//       const response = await res.json()
//       if(response.success){
//      localStorage.setItem("token",response.jwtToken)
//      localStorage.setItem("user",response.email)
//      localStorage.setItem("role",response.role)
//       toast.success('Logged in successfully!', {
//         autoClose: 2000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
     
        
    
//     }
// else{
//   toast.error(response.error, {
//     autoClose: 2000,
//     hideProgressBar: false,
//     closeOnClick: true,
//     pauseOnHover: true,
//     draggable: true,
//     progress: undefined,
//   });
// }
   
    

  }
  return (
    <>
    <section className="h-screen">
    <div className=" py-12 px-6 h-full">
   
      <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
        <div className="xl:w-6/12">
          <div className="block bg-white shadow-lg rounded-lg">
            <div className="flex justify-center items-center g-0">
              <div className=" px-4 md:px-0">
                <div className="md:p-12 md:mx-6">
                  <div className="text-center rounded-full">
                    <h4 className="text-2xl font-bold mt-1 mb-5 pb-1 text-gray-800">Log in to your account</h4>
                  </div>
                  <form onSubmit={handleLogin}>
                    {/* <p className="mb-4">Please login to your account</p> */}
                    <div className="mb-4">
                      <input 
                      onChange={handleChange}
                        type="email"
                        className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        id="email"
                        placeholder="Email"
                        name="email"
                      />
                    </div>
                    <div className="mb-4">
                      <input
                      onChange={handleChange}
                        type="password"
                        className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        id="password"
                        placeholder="Password"
                        name="password"
                      />
                    </div>
                    <div className="text-center pt-1 mb-12 pb-1">
                      <button
                        className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight uppercase rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-[#459C98] hover:bg-[#23847f]"
      
                        data-mdb-ripple="true"
                        data-mdb-ripple-color="light"
                        type="submit"
                      
                      >
                        Log in
                      </button>
                     <Link to="/forgotpassword" ><a className="text-gray-600 hover:text-gray-700">Forgot password?</a></Link>
                    </div>
                    <div className="flex items-center justify-between pb-6">
                      <p className="mb-0 mr-2">Don&apos;t have an account?</p>
                      <Link to="/signup"><button
                        type="button"
                        className="inline-block px-6 py-2 border-2 border-[#459C98] text-[#22746f] font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                        data-mdb-ripple="true"
                        data-mdb-ripple-color="light"
                      >
                        Sign Up
                      </button></Link>
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
