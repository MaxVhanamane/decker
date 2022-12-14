
import { useEffect, createContext, ReactNode, useState } from "react";
import { request } from "./../utils/axios-utils";
import { userData } from "../types/types";
type UserContextProvider = {
  children: ReactNode;
};
export const UserContext = createContext<any>({
  _id: "",
  username: "",
  email: "",
  __v: 0,
});

function UserContextProvider({ children }: UserContextProvider) {
  const [userInfo,setUserInfo]=useState<userData | null>()
  const getUser = async (): Promise<any> => {
    const data = await request.get("/getuser");
    localStorage.setItem("userInfo",JSON.stringify(data.data))
    const newD=localStorage.getItem("userInfo")
    setUserInfo({...JSON.parse(newD!)})

    return data.data;
  };
  useEffect(()=>{
    getUser()
  },[])

  // const { data, isError, error } = useQuery<userData>("user", getUser); 
  return <UserContext.Provider value={{userInfo,setUserInfo:setUserInfo}}>{children}</UserContext.Provider>;
}

export default UserContextProvider;

// import { useContext, createContext, ReactNode, useState } from "react";
// import { request } from "./../utils/axios-utils";
// import { useQuery } from "react-query";
// import { userData } from "../types/types";
// import { Navigate } from "react-router-dom";
// type UserContextProvider = {
//   children: ReactNode;
// };
// export const UserContext = createContext<any>({
//   _id: "",
//   username: "",
//   email: "",
//   __v: 0,
// });

// function UserContextProvider({ children }: UserContextProvider) {
//     const [userInfo,setUserInfo]=useState<userData | null>()
//   const getUser = async (): Promise<any> => {
//     const data = await request.get("/getuser");
//     setUserInfo(data.data)
//     return data.data;
//   };

//   const { data, isError, error } = useQuery<userData>("user", getUser); 

//   return <UserContext.Provider value={{userInfo,setUserInfo:setUserInfo}}>{children}</UserContext.Provider>;
// }

// export default UserContextProvider;
