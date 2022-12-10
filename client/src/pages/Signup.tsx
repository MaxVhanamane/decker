import React, { useState,useEffect } from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { FormEvent } from 'react';
import { ChangeEvent } from 'react';
import { request } from './../utils/axios-utils';

export default function SignUp() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
 

  useEffect(()=>{
    const token=localStorage.getItem("token")
    // if(token){
    //  router.push("/")
    // }
     },[])


  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "username") {
        setUsername(e.target.value)
    }
    else if (e.target.name === "email") {
      setEmail(e.target.value)
    }
    else if (e.target.name === "password") {
      setPassword(e.target.value)
    }
    else if (e.target.name === "confirmPass") {
      setConfirmPass(e.target.value)
    }
  }
 
  
  const handleSignup = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password === confirmPass) {
      if(password.length>7 && confirmPass.length>7){

     
      const data = { username, email, password };
      request.post("/signup",data, { withCredentials: true })

    //   const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/signup`, {
    //     method: 'POST', // or 'PUT'
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    //   })
    //   const response = await res.json()
    //   if(response.success){
    //     toast.success('Your account has been created successfully!', {
      
    //       autoClose: 2000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   }
     
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
    else{
      toast.error("password must be at least 8 characters long", {
     
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }
    else{
      toast.error("Password and confirm password didn't match", {
     
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

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

                      <h4 className="text-2xl font-bold mt-1 mb-5 pb-1 text-gray-800">Sign up for an account</h4>
                    </div>
                    <form onSubmit={handleSignup}>
                      {/* <p className="mb-4">Please login to your account</p> */}
                      <div className="mb-4">
                        <input onChange={handleChange}
                          type="text"
                          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                          id="username"
                          name="username"
                          value={username}
                          placeholder="Name"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input onChange={handleChange}
                          type="email"
                          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                          id="email"
                          name="email"
                          value={email}
                          placeholder="Email"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <input onChange={handleChange}
                          type="password"

                          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                          id="password"
                          name="password"
                          value={password}
                          placeholder="Password" 
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input onChange={handleChange}
                          type="password"
                          className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                          id="confirmpassword"
                          name="confirmPass"
                          value={confirmPass}
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                      <div className="text-center pt-1 mb-10 pb-1">
                        <button
                          className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight uppercase rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-[#459C98] hover:bg-[#23847f] "
                          type="submit"
                          data-mdb-ripple="true"
                          data-mdb-ripple-color="light"

                        >
                          Sign Up
                        </button>

                      </div>
                      <div className="flex items-center justify-between pb-6">
                        <p className="mb-0 mr-2">Have an account?</p>
                        <Link to="/login"><button
                          type="button"
                          className="inline-block px-6 py-2 border-2 border-[#459C98] text-[#22746f] font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                          data-mdb-ripple="true"
                          data-mdb-ripple-color="light"
                        >
                          LOGIN
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
