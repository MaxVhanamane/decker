import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Navbar from "./componenets/Navbar";
import { BrowserRouter } from "react-router-dom";
import {QueryClientProvider,QueryClient} from "react-query"
import {ReactQueryDevtools} from "react-query/devtools"




const queryClient= new QueryClient()
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <Navbar/>
   
    <App />
   
  </BrowserRouter>
     <ReactQueryDevtools initialIsOpen={false} position="bottom-right"/>
     </QueryClientProvider>
    
  </React.StrictMode>
)
