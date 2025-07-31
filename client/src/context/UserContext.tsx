import {
  useEffect,
  createContext,
  ReactNode,
  useState,
  Dispatch,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import type { userData } from "../types/types";
import debounce from "lodash/debounce";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

interface ContexType {
  userInfo:
    | {
        username: string;
        profile_picture: string;
      }
    | null
    | undefined;
  setUserInfo: Dispatch<React.SetStateAction<userData | null>>;
  setUserEmailAddress: Dispatch<React.SetStateAction<string | null>>;
  showInstallAppButton: boolean;
  userEmailAddress: string | null;
  setShowInstallAppButton: Dispatch<React.SetStateAction<boolean>>;
  handleInstallApp: () => void;
}

export const UserContext = createContext<ContexType>({
  userInfo: {
    username: "",
    profile_picture: "",
  },
  setUserInfo: () => {},
  userEmailAddress: null,
  showInstallAppButton: false,
  setShowInstallAppButton: () => {},
  setUserEmailAddress: () => {},
  handleInstallApp: () => {},
});

// Note: If you use the useNavigate() or useLocation hooks from react-router-dom within a Context API, that Context API will rerender whenever the route changes.

function UserContextProvider({ children }: { children: ReactNode }) {
  const [showInstallAppButton, setShowInstallAppButton] = useState(false);
  const [userEmailAddress, setUserEmailAddress] = useState<string | null>(null);
  const [beforeInstallHandlerRun, setBeforeInstallHandlerRun] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [userInfo, setUserInfo] = useState<userData | null>(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
    return userInfo;
  });

  useEffect(() => {
    const beforeInstallHandler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      if (event) {
        // "Storing the showInstallAppButton value in local storage and using it on the Auth Success page to set the showInstallAppButton global state is necessary. This is because, when a user is on the login page and we set setShowInstallAppButton(true), this state will lose its value if the user uses Google Login. Google Login redirects the user to an external URL, and when they return to the app after logging in, the showInstallAppButton state will revert to its default value, which is false. Consequently, the 'Install Decker App' button won't be displayed because the beforeinstallprompt event only fires once when the app loads. To prevent this, we save the value in local storage and use it on the Auth Success page, removing it from there afterward. We've used an if condition to set the value in local storage to avoid unnecessary updates when the user refreshes the page while logged in, triggering the beforeinstallprompt event."
        if (!showInstallAppButton) {
          localStorage.setItem("showInstallAppButton", JSON.stringify(true));
        }
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
  }, [showInstallAppButton]);

  useLayoutEffect(() => {
    //When you give a fixed height and open the app in a mobile browser, you might observe the edit modal changing its height when the browser address bar hides and shows. This can hide the bottom part of the edit modal, requiring you to scroll to see it. To avoid that, we will calculate the proper available height and set it.
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--window-height",
        `${window.innerHeight}px`
      );
    };

    // Initial setup
    handleResize();

    // Add event listener
    window.addEventListener("resize", debounce(handleResize, 500));

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (beforeInstallHandlerRun && userInfo) {
      localStorage.removeItem("showInstallAppButton");
    }
  }, [beforeInstallHandlerRun, userInfo]);

  const contextValue = useMemo(() => {
    return {
      userInfo,
      setUserInfo,
      showInstallAppButton,
      setShowInstallAppButton,
      handleInstallApp,
      userEmailAddress,
      setUserEmailAddress,
    };
  }, [
    userInfo,
    setUserInfo,
    showInstallAppButton,
    setShowInstallAppButton,
    handleInstallApp,
    userEmailAddress,
    setUserEmailAddress,
  ]);

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export default UserContextProvider;
