import {
  useEffect,
  createContext,
  ReactNode,
  useState,
  Dispatch,
  useRef,
  RefObject,
} from "react";
import { request } from "../utils/axios-utils";
import { userData } from "../types/types";
import { useLocation, useNavigate } from "react-router-dom";

type UserContextProvider = {
  children: ReactNode;
};

interface ContexType {
  userInfo:
    | {
        username: string;
        profile_picture: string;
        email: string;
      }
    | null
    | undefined;

  setUserInfo: Dispatch<React.SetStateAction<userData | null>>;
  setIndexOfCardForDeletion: Dispatch<React.SetStateAction<number | null>>;

  theme: string | null;

  setTheme: Dispatch<React.SetStateAction<string | null>>;
  deleteConfirmationModalForCard: RefObject<HTMLDivElement>;
  divRefForUserSettings: RefObject<HTMLDivElement>;
  indexOfCardForDeletion: number | null;
}
export const UserContext = createContext<ContexType>({
  userInfo: {
    username: "",
    profile_picture: "",
    email: "",
  },
  setUserInfo: () => {},
  theme: null,
  setTheme: () => {},
  deleteConfirmationModalForCard: {
    current: null,
  } as RefObject<HTMLDivElement>,
  divRefForUserSettings: { current: null } as RefObject<HTMLDivElement>,
  setIndexOfCardForDeletion: () => {},
  indexOfCardForDeletion: null,
});

function UserContextProvider({ children }: UserContextProvider) {
  const [theme, setTheme] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const deleteConfirmationModalForCard = useRef<HTMLDivElement>(null);
  const divRefForUserSettings = useRef<HTMLDivElement>(null);
  const pathNames = [
    "/signup",
    "/verifyemail",
    "/forgotpassword",
    "/changepassword",
    "/login",
    "/accountdeletionsuccess",
  ];
  const authPaths = ["/auth/success", "/auth/failure"];
  const [userInfo, setUserInfo] = useState<userData | null>(null);
  const [indexOfCardForDeletion, setIndexOfCardForDeletion] = useState<
    number | null
  >(null);
  const getUser = async (): Promise<any> => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
      // User is visiting the website for the first time or not logged in
      if (pathNames.includes(location.pathname)) {
        navigate(location.pathname);
      }
      if (authPaths.includes(location.pathname)) {
        navigate(location.pathname);
      } else {
        navigate("/login"); // Redirect to the login page
      }
      return null;
    }
    const data = await request.get("/getuser");
    if (data.data) {
      localStorage.setItem("userInfo", JSON.stringify(data.data));
      setUserInfo(data.data);
    } else if (pathNames.includes(location.pathname)) {
      navigate(location.pathname);
    } else if (authPaths.includes(location.pathname)) {
      navigate("/login");
    } else {
      setUserInfo(null);
      localStorage.removeItem("userInfo");
      navigate("/sessionexpired");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // give default theme as dark
  useEffect(() => {
    const userThemePreference = localStorage.getItem("theme");

    if (userThemePreference) {
      // User has already selected a theme, use their preference
      setTheme(userThemePreference);
    } else {
      // No user preference found, default to dark theme
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      localStorage.getItem("theme") === null
    ) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-[#0c1221]");
      document.documentElement.classList.add("bg-[#0c1221]");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-[#0c1221]");
      document.documentElement.classList.remove("bg-[#0c1221]");
    }
    // To avoid white or dark screen flicker, I have added the "hidden" class to the <html> tag and remove it once all the necessary classes are set.
    if (document.body.classList.contains("hidden")) {
      document.body.classList.remove("hidden");
    }
  }, [theme]);

  //If the user changes the theme preference directly from localStorage or tampers with the userInfo, we will listen for that change and take appropriate action accordingly.
  useEffect(() => {
    // If the user changes the information stored in localStorage, we will log them out.
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

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") {
        const newTheme = event.newValue;
        const allowedThemes = ["dark", "light"]; // the allowed theme values

        // Check if the new theme value is not null and is one of the allowed themes
        if (newTheme && allowedThemes.includes(newTheme)) {
          setTheme(newTheme);
        } else {
          // Fallback to a default theme:
          setTheme("dark");
          // Reset the theme value in localStorage to the default dark theme
          localStorage.setItem("theme", "dark");
        }
      } else if (event.key === "userInfo") {
        const userInfoFromLocalStorage = localStorage.getItem("userInfo");
        let localUserInfo;

        try {
          localUserInfo = userInfoFromLocalStorage
            ? JSON.parse(userInfoFromLocalStorage)
            : null;
        } catch {
          handleLogoutAndRedirect();
          return;
        }
        if (
          userInfo?.email !== localUserInfo.name ||
          userInfo?.email !== localUserInfo.email ||
          userInfo?.profile_picture !== localUserInfo.profile_picture
        ) {
          handleLogoutAndRedirect();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userInfo]);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        setUserInfo,
        theme,
        setTheme,
        deleteConfirmationModalForCard,
        indexOfCardForDeletion,
        setIndexOfCardForDeletion,
        divRefForUserSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;

// bg-[#0D1017]
