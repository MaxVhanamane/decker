import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import getDecksAndCardsCache from "../hooks/useGetDecksAndCardsCache";
import { useQueryClient } from "@tanstack/react-query";
import { AlertContext } from "../context/AlertContext";

export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const { userInfo, isAuthenticating } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { setAlert } = useContext(AlertContext);

  useEffect(() => {
    if (!isAuthenticating && !userInfo) {
      navigate("/login");
    }
    if (userInfo) {
      // Caching 'DecksAndCards' allows users to immediately view search results because, for search results, you need all the decks and cards, which might be huge in size. Prefetching and caching this data helps deliver faster results to the user.
      getDecksAndCardsCache({ queryClient, setAlert });
    }
  }, [isAuthenticating, userInfo]);

  if (isAuthenticating) {
    return (
      <div className=" fixed top-0 left-0   w-full h-full flex items-center justify-center flex-col gap-2">
        <img
          onError={(e) => {
            // In Firefox, the alt text is displayed while loading the actual image, which may not look aesthetically pleasing. To address this, I initially set the text color to transparent. Once the image has loaded, I dynamically change the text color. This ensures that even if the image fails to load, the user will see the alt text.
            const element = e.target as HTMLImageElement;
            element.classList.add("!text-gray-700", "dark:!text-gray-200");
          }}
          onLoad={(e) => {
            const element = e.target as HTMLImageElement;
            element.classList.add("!text-gray-700", "dark:!text-gray-200");
          }}
          src="/illustrations/auth.svg"
          className="w-40 h-40 lg:w-48 lg:h-48 text-transparent"
          alt="Authenticating"
        />
        <div className=" flex items-center justify-center gap-2 ">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
          <p
            className={`  ${
              localStorage.getItem("theme") === "dark" ||
              localStorage.getItem("theme") === null
                ? "text-gray-200"
                : "text-gray-700"
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
