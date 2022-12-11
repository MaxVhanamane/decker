import {useContext,createContext, ReactNode} from "react"
import { request } from './../utils/axios-utils';
import { useQuery } from 'react-query';

export const Context=createContext<null | any>(null)

function UserContext(props:any){
    const getUser=async():Promise<any>=>{
       const data= await request.get("/getuser")
       console.log(data)
        return data.data
    }

    const {data,isError,error}=useQuery("user",getUser)
 console.log("context",data)

   return (<Context.Provider value={data}>{props.children}</Context.Provider>)
}

export default UserContext
