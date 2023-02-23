import React,{ReactNode} from 'react'
import { createContext, useState } from "react";
import { AlertType } from '../types/types';
type AlertContextType = {
    children: ReactNode;
  };
// creating context object and exporting it.
export const AlertContext = createContext<AlertType>({alert:{
    severity: "",
    show: false,
    message: "",
    autoHideDuration:3000
},setAlert:()=>{}});


function AlertState(props:AlertContextType) {
    const [alert, setAlert] = useState({
        severity: "success",
        show: false,
        message: "",
        autoHideDuration:3000
    })

    return (
        <AlertContext.Provider value={{ alert, setAlert}}>
            {/* Provider will give access to all the above states and functions to the components which are in props.children */}
            {props.children}
        </AlertContext.Provider>
    )
}

export default AlertState

