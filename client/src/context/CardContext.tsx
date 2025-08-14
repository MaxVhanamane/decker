import { Dispatch, ReactNode, createContext, useMemo, useState } from "react";

type CardContextType = {
  undoCardCardId: string | null;
  shouldTrashCanRotate: boolean;
  setUndoCardId: Dispatch<React.SetStateAction<string | null>>;
  setShouldTrashCanRotate: Dispatch<React.SetStateAction<boolean>>;
};

export const CardContext = createContext<CardContextType>({
  undoCardCardId: null,
  shouldTrashCanRotate: false,
  setUndoCardId: () => {},
  setShouldTrashCanRotate: () => {},
});

const CardContextProvider = ({ children }: { children: ReactNode }) => {
  const [undoCardCardId, setUndoCardId] = useState<string | null>(null);
  const [shouldTrashCanRotate, setShouldTrashCanRotate] = useState(false);

  const cardContextValue = useMemo(() => {
    return {
      shouldTrashCanRotate,
      setShouldTrashCanRotate,
      undoCardCardId,
      setUndoCardId,
    };
  }, [
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
