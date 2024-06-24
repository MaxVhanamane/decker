import { useNavigate } from "react-router-dom";
import { useContext, FC, useEffect } from "react";
import { ThemeContext, UserContext } from "../context/UserContext";
const AuthFailure: FC = () => {
  const { userInfo } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
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
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center dark:bg-slate-900 bg-[#fcfefc]  gap-4  ">
      <div className="flex items-center justify-center flex-col ">
        <img
          src={
            theme === "dark"
              ? "/illustrations/auth_failure_dark.svg"
              : "/illustrations/auth_failure_light.svg"
          }
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
          className="font-bold border-2 border-teal-600 mt-2 text-teal-800 px-2 py-1 rounded-lg hover:border-teal-500 dark:bg-transparent dark:hover:border-sky-400  dark:border-sky-500 dark:text-gray-50"
          aria-label="Go to Login Page"
        >
          Go to Login Page
        </button>
      </div>
    </div>
  );
};
export default AuthFailure;
