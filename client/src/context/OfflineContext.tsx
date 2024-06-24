import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  ReactNode,
} from "react";
import { DeckTypeForSearch } from "../types/types";

interface ContexType {
  isOnline: boolean;
  setIsOnline: Dispatch<React.SetStateAction<boolean>>;
  deck: null | DeckTypeForSearch;
  setDeck: Dispatch<React.SetStateAction<null | DeckTypeForSearch>>;
}
type OfflineContextProvider = {
  children: ReactNode;
};
export const OfflineContext = createContext<ContexType>({
  isOnline: true,
  setIsOnline: () => {},
  deck: null,
  setDeck: () => {},
});

const OfflineProvider = ({ children }: OfflineContextProvider) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deck, setDeck] = useState<null | DeckTypeForSearch>(null);
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

  return (
    <OfflineContext.Provider value={{ isOnline, setIsOnline, deck, setDeck }}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;

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
