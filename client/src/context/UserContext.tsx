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
        _id: string;
        username: string;
        profile_picture: string;
        email: string;
        __v: number;
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
  showSearchBar: boolean;
  setShowSearchBar: Dispatch<React.SetStateAction<boolean>>;
}
export const UserContext = createContext<ContexType>({
  userInfo: {
    _id: "",
    username: "",
    profile_picture: "",
    email: "",
    __v: 0,
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
  showSearchBar: false,
  setShowSearchBar: () => {},
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
  const [userInfo, setUserInfo] = useState<userData | null>({
    _id: "",
    username: "",
    profile_picture: "",
    email: "",
    __v: 0,
  });
  const [indexOfCardForDeletion, setIndexOfCardForDeletion] = useState<
    number | null
  >(null);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const getUser = async (): Promise<any> => {
    const data = await request.get("/getuser");
    if (data.data) {
      localStorage.setItem("userInfo", JSON.stringify(data.data));
      setUserInfo(data.data);
      return data.data;
    } else if (pathNames.includes(location.pathname)) {
      navigate(location.pathname);
    } else {
      setUserInfo(null);
      localStorage.removeItem("userInfo");
      navigate("/sessionexpired");
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      if (localStorage.getItem("theme") == null) {
        localStorage.setItem("theme", "dark");
        setTheme(localStorage.getItem("theme"));
      } else {
        setTheme(localStorage.getItem("theme"));
      }
    } else {
      if (localStorage.getItem("theme") == null) {
        localStorage.setItem("theme", "light");
        setTheme(localStorage.getItem("theme"));
      } else {
        setTheme(localStorage.getItem("theme"));
      }
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-[#0c1221]");
      document.documentElement.classList.add("bg-[#0c1221]");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-[#0c1221]");
      document.documentElement.classList.remove("bg-[#0c1221]");
    }
  }, [theme]);

  useEffect(() => {
    const listener = ({ matches }: MediaQueryListEvent) => {
      if (matches) {
        localStorage.setItem("theme", "dark");
        setTheme(localStorage.getItem("theme"));
      } else {
        localStorage.setItem("theme", "light");
        setTheme(localStorage.getItem("theme"));
      }
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", listener);
    };
  }, []);

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
        showSearchBar,
        setShowSearchBar,
        divRefForUserSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;

// bg-[#0D1017]
