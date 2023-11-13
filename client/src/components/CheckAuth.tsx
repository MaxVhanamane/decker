import { useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function CheckAuth() {
  const navigate = useNavigate();
  const { userInfo, isAuthenticating, setUserInfo } = useContext(UserContext);
  const location = useLocation();
  useEffect(() => {
    if (
      location?.state?.from === "/cards" ||
      location?.state?.from === "/decks"
    ) {
      setUserInfo(null);
      return;
    }
    if (!isAuthenticating && userInfo) {
      navigate("/");
    }
  }, [isAuthenticating, userInfo]);

  if (isAuthenticating) {
    return null;
  }

  return (
    <>
      {/* if user is logged in then we will give access to all the protected routes else will send him to login page  */}
      {!userInfo ? <Outlet /> : null}
    </>
  );
}
