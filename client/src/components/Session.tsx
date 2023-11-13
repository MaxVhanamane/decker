import { memo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Session = () => {
  const Navigate = useNavigate();
  const { setUserInfo } = useContext(UserContext);
  return (
    <div className="fixed top-0 left-0  w-full h-full flex items-center justify-center backdrop-blur-lg z-[70] animate-opacity_page_transition">
      <div className=" rounded-lg bg-gray-100 px-4 pt-5 pb-4 text-left shadow-xl  dark:bg-slate-800 sm:my-8 sm:w-full sm:p-6 sm:max-w-lg mx-2">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 bg-yellow-200 dark:bg-yellow-100">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-yellow-700"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
              Your session has expired
            </h3>
            <div className="mt-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-100">
                Please log in again to continue using the app.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3 sm:mt-4">
          <button
            onClick={() => {
              setUserInfo(null);
              Navigate("/login", { replace: true });
            }}
            className="bg-[#459C98] dark:bg-gray-600 border dark:border-gray-400 dark:hover:bg-gray-500  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md transition-[background-color] duration-300"
            tabIndex={0}
          >
            <div className="flex w-full items-center justify-center gap-2">
              Log in
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(Session);
