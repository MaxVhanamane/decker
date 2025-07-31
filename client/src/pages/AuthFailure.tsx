import { useNavigate } from "react-router-dom";
import { useContext, FC, useEffect } from "react";
import { UserContext } from "../context/UserContext";

const AuthFailure: FC = () => {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!userInfo) {
      timeout = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    }

    if (userInfo) {
      navigate("/");
    }
    return () => clearTimeout(timeout);
  }, [userInfo]);

  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center dark:bg-slate-900 bg-white  gap-4  ">
      <div className="flex items-center justify-center flex-col ">
        <img
          src="/illustrations/auth_failure.svg"
          className="w-48 h-48 lg:w-52 lg:h-52"
        />
        <div className=" rounded-lg ">
          <p className="text-base text-gray-800 mb-1 dark:text-gray-50">
            Login failed,Please try again!
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="font-bold mt-6 p-2 rounded-lg  hover:bg-sky-700 transition-colors duration-200  bg-sky-600 text-white"
          aria-label="Go to Login Page"
        >
          Go to Login Page
        </button>
      </div>
    </div>
  );
};
export default AuthFailure;
