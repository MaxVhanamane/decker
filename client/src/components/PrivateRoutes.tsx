import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { request } from "../utils/axios-utils";
export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  const userFromLocalStorage = localStorage.getItem("userInfo");
  let userInfo:
    | {
        username: string;
        profile_picture: string;
        email: string;
      }
    | null
    | undefined;
  try {
    userInfo = userFromLocalStorage ? JSON.parse(userFromLocalStorage) : null;
  } catch (error) {
    userInfo = null;
  }

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const res = await request.post("/auth/logout");
        return res;
      } catch (error) {
        throw new Error("Logout failed");
      }
    };

    const handleLogoutAndRedirect = async () => {
      try {
        const res = await handleLogout();
        if (res.data === "done") {
          setUserInfo(null);
          localStorage.removeItem("userInfo");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        setUserInfo(null);
        localStorage.removeItem("userInfo");
        navigate("/login", { replace: true });
      }
    };

    if (!userInfo) {
      handleLogoutAndRedirect();
    }
  }, [userInfo]);
  return (
    <>
      {/* if user is logged in then we will give access to all the protected routes else will send him to login page  */}
      {userInfo ? <Outlet /> : null}
    </>
  );
}
