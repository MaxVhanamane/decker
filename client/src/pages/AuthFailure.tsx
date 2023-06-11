import { useNavigate } from "react-router-dom";
import { useContext, FC } from "react";
import { UserContext } from "../context/UserContext";
import { AiOutlineCloseCircle } from "react-icons/ai";
const AuthFailure: FC = () => {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  if (!userInfo) {
    navigate("/login");
  }

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center dark:bg-[#0c1221] bg-white  gap-4 -z-10 ">
        <div className="dark:bg-slate-800 bg-gray-300 p-8 rounded-md flex items-center justify-center flex-col relative h-48">
          <div className="bg-red-600 w-full flex items-center justify-center absolute top-0 h-[45%] rounded-tl-md rounded-tr-md">
            <p className="text-5xl p-1 text-gray-50">
              <AiOutlineCloseCircle />
            </p>
          </div>
          <div className="mt-20">
            <div className=" rounded-lg ">
              <p className="text-md text-gray-800 mb-1 dark:text-gray-50">
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
      </div>
    </>
  );
};
export default AuthFailure;
