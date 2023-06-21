import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  ReactNode,
} from "react";
import { request } from "../utils/axios-utils";

interface ContexType {
  isOnline: boolean;
  setIsOnline: Dispatch<React.SetStateAction<boolean>>;
}
type OfflineContextProvider = {
  children: ReactNode;
};
export const OfflineContext = createContext<ContexType>({
  isOnline: true,
  setIsOnline: () => {},
});

const OfflineProvider = ({ children }: OfflineContextProvider) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // const pingServer = async () => {
  //   try {
  //     const response = await request.get("/ping");
  //     console.log(response);
  //     if (response.status === 200) {
  //       setIsOnline(true);
  //     }
  //   } catch {
  //     setIsOnline(false);
  //   }
  // };

  // useEffect(() => {
  //   const timer = setInterval(pingServer, 5000);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // });

  return (
    <OfflineContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;
