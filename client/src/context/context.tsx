
import { useEffect, createContext, ReactNode, useState, Dispatch } from "react";
import { request } from "./../utils/axios-utils";
import { userData } from "../types/types";
import { useNavigate } from "react-router-dom";

type UserContextProvider = {
  children: ReactNode;
};

interface ContexType{
  
  userInfo:  { _id: string,
    username: string,
    profile_picture:string,
    email: string,
    __v: number} | null | undefined ,

    setUserInfo: Dispatch<React.SetStateAction<userData | null>>,

    theme:string | null,

    setTheme:Dispatch<React.SetStateAction<string | null>>
}
export const UserContext = createContext<ContexType >({userInfo:{
  _id: "",
  username: "",
  profile_picture:"",
  email: "",
  __v: 0,
},
setUserInfo:()=>{},
theme:null,
setTheme:()=>{}
});

function UserContextProvider({ children }: UserContextProvider) {
  const [theme,setTheme]=useState<string | null> (null)
const navigate=useNavigate()
  const [userInfo,setUserInfo]=useState<userData | null>( { _id: "",
    username: "",
    profile_picture:"",
    email: "",
    __v: 0})
  const getUser = async (): Promise<any> => {
    const data = await request.get("/getuser");
    if(data.data){
      localStorage.setItem("userInfo",JSON.stringify(data.data))
      const newD=localStorage.getItem("userInfo")
      setUserInfo({...JSON.parse(newD!)})
      return data.data;
    }
    else{
      navigate("/login")
    }
    
  };
  useEffect(()=>{
    getUser()
  },[])


  

  useEffect(()=>{
    if( window.matchMedia('(prefers-color-scheme: dark)').matches  ){
      let theme=localStorage.getItem("theme")
      if(theme==="dark"){
        localStorage.setItem("theme","dark")
        setTheme(localStorage.getItem("theme"))
      }
      else{
        localStorage.setItem("theme","light")
        setTheme(localStorage.getItem("theme"))
      }
      
    }
    else{
      let theme=localStorage.getItem("theme")

      if(theme==="light"){
        localStorage.setItem("theme","light")
        setTheme(localStorage.getItem("theme"))
      }
      else{
        localStorage.setItem("theme","dark")
        setTheme(localStorage.getItem("theme"))
      }
     

    }
  },[])

  useEffect(()=>{
    if(theme==="dark"){
      document.documentElement.classList.add("dark")
      document.body.classList.add("bg-slate-900")
      document.documentElement.classList.add("bg-slate-900")

    }
    else{
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("bg-slate-900")
      document.documentElement.classList.remove("bg-slate-900")

    }
  },[theme])

  // useEffect(()=>{
  //   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',({ matches }) => {
  //     if (matches) {
  //     localStorage.setItem("theme","dark")
  //     setTheme(localStorage.getItem("theme"))
  //     } else {
  //     localStorage.setItem("theme","light")
  //     setTheme(localStorage.getItem("theme"))
      
  //     }
  //       })
  // },[])

  useEffect(() => {
    const listener = ({ matches }: MediaQueryListEvent) => {
      if (matches) {
        localStorage.setItem("theme","dark");
        setTheme(localStorage.getItem("theme"));
      } else {
        localStorage.setItem("theme","light");
        setTheme(localStorage.getItem("theme"));
      }
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    };
  }, []);

  return <UserContext.Provider value={{userInfo,setUserInfo,theme,setTheme}}>{children}</UserContext.Provider>;
}

export default UserContextProvider;


