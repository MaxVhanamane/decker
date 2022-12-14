import { ReactNode ,useContext} from 'react';
import Navbar from './Navbar';
import { UserContext } from './../context/context';
interface Props {
    children?: ReactNode
    // any props that come into the component
}
export default function Layout({children}:Props) {
  const {userInfo,setUserInfo}=useContext(UserContext)

  return (
    <div>
     {userInfo? <Navbar/>:null}
      {children}
    </div>
  )
}
