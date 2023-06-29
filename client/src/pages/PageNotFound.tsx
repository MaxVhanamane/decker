import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="fixed top-0  h-screen left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
      <img
        className="lg:w-80 lg:h-64 w-72 h-44 md:w-80 md:h-52 "
        src={`/illustrations/${
          theme === "dark"
            ? "page_not_found_dark.svg"
            : "page_not_found_light.svg"
        }`}
      />
      <p className="font-bold text-lg dark:text-gray-50 text-gray-800">
        Page not found!{" "}
      </p>
      <button
        onClick={() => navigate("/")}
        className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out   "
        type="button"
        aria-label="Go Home"
      >
        Go Home
      </button>
    </div>
  );
}
