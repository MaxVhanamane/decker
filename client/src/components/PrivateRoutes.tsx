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
    return (
      <div className=" absolute top-0 left-0   w-full h-full flex items-center justify-center flex-col gap-2">
        <img
          src="/illustrations/auth.svg"
          className="w-40 h-40 lg:w-48 lg:h-48"
          alt="Authenticating"
        />
        <div className=" flex items-center justify-center gap-2 ">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
          <p
            className={`  ${
              localStorage.getItem("theme") === "dark" ||
              localStorage.getItem("theme") === null
                ? "text-gray-200"
                : "text-gray-600"
            }`}
          >
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* if user is logged in then we will give access to all the protected routes else will send him to login page  */}
      {userInfo ? <Outlet /> : null}
    </>
  );
}
