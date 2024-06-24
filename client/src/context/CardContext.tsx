import {
  Dispatch,
  ReactNode,
  RefObject,
  createContext,
  useMemo,
  useRef,
  useState,
} from "react";

type CardContextType = {
  indexOfCardForDeletion: number | null;
  setIndexOfCardForDeletion: Dispatch<React.SetStateAction<number | null>>;
  deleteConfirmationModalForCard: RefObject<HTMLDivElement>;
};

export const CardContext = createContext<CardContextType>({
  indexOfCardForDeletion: null,
  setIndexOfCardForDeletion: () => {},
  deleteConfirmationModalForCard: {
    current: null,
  } as RefObject<HTMLDivElement>,
});

const CardContextProvider = ({ children }: { children: ReactNode }) => {
  const deleteConfirmationModalForCard = useRef<HTMLDivElement>(null);

  const [indexOfCardForDeletion, setIndexOfCardForDeletion] = useState<
    number | null
  >(null);

  const cardContextValue = useMemo(() => {
    return {
      indexOfCardForDeletion,
      setIndexOfCardForDeletion,
      deleteConfirmationModalForCard,
    };
  }, [
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
  ]);

  return (
    <CardContext.Provider value={cardContextValue}>
      {children}
    </CardContext.Provider>
  );
};

export { CardContextProvider };
