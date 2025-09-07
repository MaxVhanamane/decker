import { ReactNode, memo } from "react";
import Navbar from "./navbar/Navbar";
import { useLocation } from "react-router-dom";
interface Props {
  children?: ReactNode;
}
const Layout = ({ children }: Props) => {
  const location = useLocation();
  const paths = ["/auth/success", "/auth/failure"];
  // As I don't want to show Navbar on these pages ["/auth/success","/auth/failure"] we will exclude them.
  return (
    <div className="flex items-center justify-center w-full">
      <div id="chapters-portal"></div>
      <div className="flex-1 w-full">
        {!paths.includes(location.pathname) ? <Navbar /> : null}
        {children}
      </div>
    </div>
  );
};

export default memo(Layout);
