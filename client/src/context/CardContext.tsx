import { Dispatch, ReactNode, createContext, useMemo, useState } from "react";

type CardContextType = {
  undoCardCardId: string | null;
  indexOfCardForDeletion: number | null;
  shouldTrashCanRotate: boolean;
  setIndexOfCardForDeletion: Dispatch<React.SetStateAction<number | null>>;
  setUndoCardId: Dispatch<React.SetStateAction<string | null>>;
  setShouldTrashCanRotate: Dispatch<React.SetStateAction<boolean>>;
};

export const CardContext = createContext<CardContextType>({
  undoCardCardId: null,
  shouldTrashCanRotate: false,
  indexOfCardForDeletion: null,
  setUndoCardId: () => {},
  setIndexOfCardForDeletion: () => {},
  setShouldTrashCanRotate: () => {},
});

const CardContextProvider = ({ children }: { children: ReactNode }) => {
  const [undoCardCardId, setUndoCardId] = useState<string | null>(null);
  const [shouldTrashCanRotate, setShouldTrashCanRotate] = useState(false);
  const [indexOfCardForDeletion, setIndexOfCardForDeletion] = useState<
    number | null
  >(null);

  const cardContextValue = useMemo(() => {
    return {
      indexOfCardForDeletion,
      setIndexOfCardForDeletion,
      shouldTrashCanRotate,
      setShouldTrashCanRotate,
      undoCardCardId,
      setUndoCardId,
    };
  }, [
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    shouldTrashCanRotate,
    setShouldTrashCanRotate,
    undoCardCardId,
    setUndoCardId,
  ]);

  return (
    <CardContext.Provider value={cardContextValue}>
      {children}
    </CardContext.Provider>
  );
};

export { CardContextProvider };
