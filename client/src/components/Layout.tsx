import { ReactNode} from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';
interface Props {
    children?: ReactNode
    // any props that come into the component
}
export default function Layout({children}:Props) {
const location=useLocation()
const paths=["/auth/success","/auth/failure"]

  return (
    <div >
   {!(paths.includes(location.pathname)) ?<Navbar/>:null}
      {children}
    </div>
  )
}
