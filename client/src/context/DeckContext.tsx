import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useMemo,
  useRef,
  useState,
  createContext,
  useEffect,
} from "react";

type DeckContextType = {
  newlyAddedDeckId: string | null;
  setNewlyAddedDeckId: Dispatch<SetStateAction<string | null>>;
  deckContainerRef: RefObject<HTMLDivElement>;
};

export const DeckContext = createContext<DeckContextType>({
  newlyAddedDeckId: null,
  setNewlyAddedDeckId: () => {},
  deckContainerRef: { current: null },
});

const DeckContextProvider = ({ children }: { children: ReactNode }) => {
  const [newlyAddedDeckId, setNewlyAddedDeckId] = useState<string | null>(null);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  // const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" && newlyAddedDeckId) {
      setNewlyAddedDeckId(null);
    }
  }, [location.pathname]);

  const contextValue = useMemo(
    () => ({
      newlyAddedDeckId,
      setNewlyAddedDeckId,
      deckContainerRef,
    }),
    [newlyAddedDeckId]
  );

  return (
    <DeckContext.Provider value={contextValue}>{children}</DeckContext.Provider>
  );
};

export { DeckContextProvider };
