import {
  useEffect,
  createContext,
  ReactNode,
  useState,
  Dispatch,
  useRef,
  RefObject,
  useCallback,
} from "react";
import { request } from "../utils/axios-utils";
import { userData } from "../types/types";
import { useLocation, useNavigate } from "react-router-dom";

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

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
  showInstallAppButton: boolean;
  showLogoutModal: boolean;
  isAuthenticating: boolean;
  setShowInstallAppButton: Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticating: Dispatch<React.SetStateAction<boolean>>;
  setShowLogoutModal: Dispatch<React.SetStateAction<boolean>>;
  handleShowUserInfomation: () => void;
  handleInstallApp: () => void;
}
export const UserContext = createContext<ContexType>({
  userInfo: {
    username: "",
    profile_picture: "",
    email: "",
  },
  showLogoutModal: false,
  setUserInfo: () => {},
  theme: null,
  setTheme: () => {},
  deleteConfirmationModalForCard: {
    current: null,
  } as RefObject<HTMLDivElement>,
  divRefForUserSettings: { current: null } as RefObject<HTMLDivElement>,
  setIndexOfCardForDeletion: () => {},
  indexOfCardForDeletion: null,
  showInstallAppButton: false,
  setShowInstallAppButton: () => {},
  setShowLogoutModal: () => {},
  isAuthenticating: true,
  setIsAuthenticating: () => {},
  handleShowUserInfomation: () => {},
  handleInstallApp: () => {},
});

function UserContextProvider({ children }: UserContextProvider) {
  const [theme, setTheme] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const deleteConfirmationModalForCard = useRef<HTMLDivElement>(null);
  const divRefForUserSettings = useRef<HTMLDivElement>(null);
  const [showInstallAppButton, setShowInstallAppButton] = useState(false);
  const [beforeInstallHandlerRun, setBeforeInstallHandlerRun] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const beforeInstallHandler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      if (event) {
        // "Storing the showInstallAppButton value in local storage and using it on the Auth Success page to set the showInstallAppButton global state is necessary. This is because, when a user is on the login page and we set setShowInstallAppButton(true), this state will lose its value if the user uses Google Login. Google Login redirects the user to an external URL, and when they return to the app after logging in, the showInstallAppButton state will revert to its default value, which is false. Consequently, the 'Install Decker App' button won't be displayed because the beforeinstallprompt event only fires once when the app loads. To prevent this, we save the value in local storage and use it on the Auth Success page, removing it from there afterward. We've used an if condition to set the value in local storage to avoid unnecessary updates when the user refreshes the page while logged in, triggering the beforeinstallprompt event."

        localStorage.setItem("showInstallAppButton", JSON.stringify(true));
        setDeferredPrompt(event);
        setShowInstallAppButton(true);
        setBeforeInstallHandlerRun(true);
      }
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);

    // Remove event listeners when the component unmounts
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
    };
  }, [setShowInstallAppButton, setBeforeInstallHandlerRun]);

  const handleInstallApp = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallAppButton(false);
      }
    }
  }, [deferredPrompt, setDeferredPrompt, setShowInstallAppButton]);

  const getUser = async (): Promise<any> => {
    try {
      const data = await request.get("/getuser");
      if (data.data) {
        setUserInfo(data.data);
      } else if (pathNames.includes(location.pathname)) {
        navigate(location.pathname);
      } else if (authPaths.includes(location.pathname)) {
        navigate("/login");
      } else {
        navigate("/login");
      }
    } catch {
      setIsAuthenticating(false);
      navigate("/login");
    } finally {
      setIsAuthenticating(false);
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
      document.documentElement.style.backgroundColor = "#020617";
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-slate-950");
    } else {
      document.documentElement.style.backgroundColor = "#fcfefc";

      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-slate-950");
      document.documentElement.style.display = "";
    }
  }, [theme]);

  //If the user changes the theme preference directly from localStorage or tampers with the userInfo, we will listen for that change and take appropriate action accordingly.

  useEffect(() => {
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
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (beforeInstallHandlerRun && userInfo && !isAuthenticating) {
      localStorage.removeItem("showInstallAppButton");
    }
  }, [beforeInstallHandlerRun, userInfo, isAuthenticating]);

  const handleShowUserInfomation = () => {
    if (divRefForUserSettings.current?.classList.contains("scale-100")) {
      divRefForUserSettings.current?.classList.remove("scale-100");
      divRefForUserSettings.current?.classList.add("scale-0");
      divRefForUserSettings.current?.classList.add("hidden");
    }
  };

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
        showInstallAppButton,
        setShowInstallAppButton,
        handleShowUserInfomation,
        isAuthenticating,
        setIsAuthenticating,
        handleInstallApp,
        showLogoutModal,
        setShowLogoutModal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
