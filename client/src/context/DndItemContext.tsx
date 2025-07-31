import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import type {
  CardType,
  CurrentDraggingCardType,
  DeckType,
} from "../types/types";

// Separate state and setter contexts
type CurrentDraggingDeckType = {
  isDragging: boolean;
  isDraggingOverDeleteArea: boolean;
  deck: DeckType;
} | null;

type DndStateContextType = {
  allDecksState: DeckType[] | [];
  allCardsState: CardType | null;
};
type CurrentDraggingDeckContextType = {
  currentDraggingDeck: CurrentDraggingDeckType;
};
type CurrentDraggingCardContextType = {
  currentDraggingCard: CurrentDraggingCardType;
};
type DndActiveIdType = {
  activeId: UniqueIdentifier | null;
};
type DndFilterContextType = {
  deckIdToFilterOnDragOverDeleteArea: UniqueIdentifier | null;
  setDeckIdToFilterOnDragOverDeleteArea: Dispatch<
    SetStateAction<UniqueIdentifier | null>
  >;
};

type DndFlagsContextType = {
  isDragStarted: boolean;
};

type DndSettersContextType = {
  setAllDecksState: Dispatch<SetStateAction<DeckType[] | []>>;
  setAllCardsState: Dispatch<SetStateAction<CardType | null>>;
  setActiveId: Dispatch<SetStateAction<UniqueIdentifier | null>>;
  setCurrentDraggingDeck: Dispatch<SetStateAction<CurrentDraggingDeckType>>;
  setCurrentDraggingCard: Dispatch<SetStateAction<CurrentDraggingCardType>>;
  setDragAffectedPages: Dispatch<SetStateAction<number[]>>;
  setIsDragStarted: Dispatch<SetStateAction<boolean>>;
};

export const DndStateContext = createContext<DndStateContextType>({
  allDecksState: [],
  allCardsState: null,
});
export const DndFlagsContext = createContext<DndFlagsContextType>({
  isDragStarted: false,
});
export const DndDragAffectedPagesContext = createContext<{
  dragAffectedPages: number[];
}>({
  dragAffectedPages: [],
});
export const DndActiveIdContext = createContext<DndActiveIdType>({
  activeId: null,
});
export const DndCurrentDraggingDeckContext =
  createContext<CurrentDraggingDeckContextType>({
    currentDraggingDeck: null,
  });
export const DndCurrentDraggingCardContext =
  createContext<CurrentDraggingCardContextType>({
    currentDraggingCard: null,
  });

export const DndFilterContext = createContext<DndFilterContextType>({
  deckIdToFilterOnDragOverDeleteArea: null,
  setDeckIdToFilterOnDragOverDeleteArea: () => {},
});

export const DndSettersContext = createContext<DndSettersContextType>({
  setAllDecksState: () => {},
  setAllCardsState: () => {},
  setActiveId: () => {},
  setCurrentDraggingDeck: () => {},
  setCurrentDraggingCard: () => {},
  setIsDragStarted: () => {},
  setDragAffectedPages: () => {},
});

const DndContextProvider = ({ children }: { children: ReactNode }) => {
  // The deckIdToFilterOnDragOverDeleteArea state is used to prevent an item from returning to its original place when dropped on the delete trashcan.
  const [
    deckIdToFilterOnDragOverDeleteArea,
    setDeckIdToFilterOnDragOverDeleteArea,
  ] = useState<UniqueIdentifier | null>(null);
  const [isDragStarted, setIsDragStarted] = useState(false);
  const [allDecksState, setAllDecksState] = useState<DeckType[] | []>([]);
  const [allCardsState, setAllCardsState] = useState<CardType | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [currentDraggingDeck, setCurrentDraggingDeck] =
    useState<CurrentDraggingDeckType>(null);
  const [currentDraggingCard, setCurrentDraggingCard] =
    useState<CurrentDraggingCardType>(null);
  const [dragAffectedPages, setDragAffectedPages] = useState<number[]>([]);
  const filterContextValue = useMemo(() => {
    return {
      deckIdToFilterOnDragOverDeleteArea,
      setDeckIdToFilterOnDragOverDeleteArea,
    };
  }, [
    deckIdToFilterOnDragOverDeleteArea,
    setDeckIdToFilterOnDragOverDeleteArea,
  ]);
  const flagsContextValue = useMemo(() => ({ isDragStarted }), [isDragStarted]);
  const dragAffectedPagesContextValue = useMemo(
    () => ({ dragAffectedPages }),
    [dragAffectedPages]
  );
  const stateContextValue = useMemo(() => {
    return {
      allDecksState,
      allCardsState,
    };
  }, [allDecksState, allCardsState]);
  const activeIdContextValue = useMemo(() => {
    return {
      activeId,
    };
  }, [activeId]);
  const currentDraggingDeckContextValue = useMemo(() => {
    return {
      currentDraggingDeck,
    };
  }, [currentDraggingDeck]);
  const currentDraggingCardContextValue = useMemo(() => {
    return {
      currentDraggingCard,
    };
  }, [currentDraggingCard]);

  const settersContextValue = useMemo(() => {
    return {
      setAllDecksState,
      setActiveId,
      setCurrentDraggingDeck,
      setCurrentDraggingCard,
      setAllCardsState,
      setIsDragStarted,
      setDragAffectedPages,
    };
  }, [
    setAllDecksState,
    setActiveId,
    setCurrentDraggingDeck,
    setCurrentDraggingCard,
    setAllCardsState,
    setIsDragStarted,
    setDragAffectedPages,
  ]);

  return (
    <DndSettersContext.Provider value={settersContextValue}>
      <DndFlagsContext.Provider value={flagsContextValue}>
        <DndDragAffectedPagesContext.Provider
          value={dragAffectedPagesContextValue}
        >
          <DndStateContext.Provider value={stateContextValue}>
            <DndFilterContext.Provider value={filterContextValue}>
              <DndActiveIdContext.Provider value={activeIdContextValue}>
                <DndCurrentDraggingDeckContext.Provider
                  value={currentDraggingDeckContextValue}
                >
                  <DndCurrentDraggingCardContext.Provider
                    value={currentDraggingCardContextValue}
                  >
                    {children}
                  </DndCurrentDraggingCardContext.Provider>
                </DndCurrentDraggingDeckContext.Provider>
              </DndActiveIdContext.Provider>
            </DndFilterContext.Provider>
          </DndStateContext.Provider>
        </DndDragAffectedPagesContext.Provider>
      </DndFlagsContext.Provider>
    </DndSettersContext.Provider>
  );
};

export default DndContextProvider;
