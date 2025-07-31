import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  ReactNode,
  useMemo,
} from "react";

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

  const contextValue = useMemo(() => {
    return { isOnline, setIsOnline };
  }, [isOnline, setIsOnline]);

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;

// const pingServer = async () => {
//   try {
//     const response = await request.get("/ping");
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
