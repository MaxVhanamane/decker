import { ReactNode, memo } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
interface Props {
  children?: ReactNode;
  // any props that come into the component
}
const Layout = ({ children }: Props) => {
  const location = useLocation();
  const paths = ["/auth/success", "/auth/failure"];
  // As I don't want to show Navbar on these pages ["/auth/success","/auth/failure"] we will exclude them.
  return (
    <div>
      {!paths.includes(location.pathname) ? <Navbar /> : null}
      {children}
    </div>
  );
};

export default memo(Layout);
