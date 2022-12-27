import { ReactNode ,useContext} from 'react';
import Navbar from './Navbar';
interface Props {
    children?: ReactNode
    // any props that come into the component
}
export default function Layout({children}:Props) {

  return (
    <div >
    <Navbar/>
      {children}
    </div>
  )
}
