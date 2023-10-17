import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const { userInfo, isAuthenticating } = useContext(UserContext);

  useEffect(() => {
    if (!isAuthenticating && !userInfo) {
      navigate("/login");
    }
  }, [isAuthenticating, userInfo]);

  if (isAuthenticating) {
    return null;
  }

  return (
    <>
      {/* if user is logged in then we will give access to all the protected routes else will send him to login page  */}
      {userInfo ? <Outlet /> : null}
    </>
  );
}
