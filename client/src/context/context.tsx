
import { useEffect, createContext, ReactNode, useState, Dispatch } from "react";
import { request } from "./../utils/axios-utils";
import { userData } from "../types/types";

type UserContextProvider = {
  children: ReactNode;
};

interface ContexType{
  
  userInfo:  { _id: string,
    username: string,
    profile_picture:string,
    email: string,
    __v: number} | null | undefined ,
    setUserInfo: Dispatch<React.SetStateAction<userData | null>>;
}
export const UserContext = createContext<ContexType >({userInfo:{
  _id: "",
  username: "",
  profile_picture:"",
  email: "",
  __v: 0,
},setUserInfo:()=>{}});

function UserContextProvider({ children }: UserContextProvider) {
  const [userInfo,setUserInfo]=useState<userData | null>( { _id: "",
    username: "",
    profile_picture:"",
    email: "",
    __v: 0})
  const getUser = async (): Promise<any> => {
    const data = await request.get("/getuser");
    console.log(data.data)
    localStorage.setItem("userInfo",JSON.stringify(data.data))
    const newD=localStorage.getItem("userInfo")
    setUserInfo({...JSON.parse(newD!)})
    return data.data;
  };
  useEffect(()=>{
    getUser()
  },[])

  // const { data, isError, error } = useQuery<userData>("user", getUser); 
  return <UserContext.Provider value={{userInfo,setUserInfo}}>{children}</UserContext.Provider>;
}

export default UserContextProvider;


