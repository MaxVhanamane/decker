import ReactDOM from 'react-dom/client'
import App from './App'
import Navbar from "./componenets/Navbar";
import { BrowserRouter } from "react-router-dom";
import {QueryClientProvider,QueryClient} from "react-query"
import {ReactQueryDevtools} from "react-query/devtools"

import {  ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContextProvider from './context/context';


const queryClient= new QueryClient()
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <>
    <UserContextProvider>
    <QueryClientProvider client={queryClient}>
  
    <BrowserRouter>
    
    <ToastContainer position="top-left"
autoClose={3000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
transition={Zoom}
theme="light"/>
    <App />
   
  </BrowserRouter>

     <ReactQueryDevtools initialIsOpen={false} position="bottom-left"/>
     </QueryClientProvider>
     </UserContextProvider>
     </>

)
