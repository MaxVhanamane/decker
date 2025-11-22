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
  ChapterDetails,
  CurrentDraggingCardType,
  DeckItemType,
  DeckType,
  GetChaptersResponseType,
} from "../types/types";

// Separate state and setter contexts
type CurrentDraggingDeckType = {
  isDragging: boolean;
  isDraggingOverDeleteArea: boolean;
  deck: DeckItemType;
} | null;

type CurrentDraggingChapterType = {
  isDragging: boolean;
  isDraggingOverDeleteArea: boolean;
  chapter: ChapterDetails;
} | null;

type DndStateContextType = {
  allDecksState: DeckType | null;
  allCardsState: CardType | null;
  allChaptersState: GetChaptersResponseType | null;
};
type CurrentDraggingDeckContextType = {
  currentDraggingDeck: CurrentDraggingDeckType;
};
type CurrentDraggingCardContextType = {
  currentDraggingCard: CurrentDraggingCardType;
};
type CurrentDraggingChapterContextType = {
  currentDraggingChapter: CurrentDraggingChapterType;
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

type DndSettersContextType = {
  setAllDecksState: Dispatch<SetStateAction<DeckType | null>>;
  setAllCardsState: Dispatch<SetStateAction<CardType | null>>;
  setAllChaptersState: Dispatch<SetStateAction<GetChaptersResponseType | null>>;
  setActiveId: Dispatch<SetStateAction<UniqueIdentifier | null>>;
  setCurrentDraggingDeck: Dispatch<SetStateAction<CurrentDraggingDeckType>>;
  setCurrentDraggingCard: Dispatch<SetStateAction<CurrentDraggingCardType>>;
  setCurrentDraggingChapter: Dispatch<
    SetStateAction<CurrentDraggingChapterType>
  >;
};

export const DndStateContext = createContext<DndStateContextType>({
  allDecksState: null,
  allCardsState: null,
  allChaptersState: null,
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
export const DndCurrentDraggingChapterContext =
  createContext<CurrentDraggingChapterContextType>({
    currentDraggingChapter: null,
  });

export const DndFilterContext = createContext<DndFilterContextType>({
  deckIdToFilterOnDragOverDeleteArea: null,
  setDeckIdToFilterOnDragOverDeleteArea: () => {},
});

export const DndSettersContext = createContext<DndSettersContextType>({
  setAllDecksState: () => {},
  setAllCardsState: () => {},
  setAllChaptersState: () => {},
  setActiveId: () => {},
  setCurrentDraggingDeck: () => {},
  setCurrentDraggingCard: () => {},
  setCurrentDraggingChapter: () => {},
});

const DndContextProvider = ({ children }: { children: ReactNode }) => {
  // The deckIdToFilterOnDragOverDeleteArea state is used to prevent an item from returning to its original place when dropped on the delete trashcan.
  const [
    deckIdToFilterOnDragOverDeleteArea,
    setDeckIdToFilterOnDragOverDeleteArea,
  ] = useState<UniqueIdentifier | null>(null);
  const [allDecksState, setAllDecksState] = useState<DeckType | null>(null);
  const [allCardsState, setAllCardsState] = useState<CardType | null>(null);
  const [allChaptersState, setAllChaptersState] =
    useState<GetChaptersResponseType | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [currentDraggingDeck, setCurrentDraggingDeck] =
    useState<CurrentDraggingDeckType>(null);
  const [currentDraggingCard, setCurrentDraggingCard] =
    useState<CurrentDraggingCardType>(null);
  const [currentDraggingChapter, setCurrentDraggingChapter] =
    useState<CurrentDraggingChapterType>(null);

  const filterContextValue = useMemo(() => {
    return {
      deckIdToFilterOnDragOverDeleteArea,
      setDeckIdToFilterOnDragOverDeleteArea,
    };
  }, [
    deckIdToFilterOnDragOverDeleteArea,
    setDeckIdToFilterOnDragOverDeleteArea,
  ]);

  const stateContextValue = useMemo(() => {
    return {
      allDecksState,
      allCardsState,
      allChaptersState,
    };
  }, [allDecksState, allCardsState, allChaptersState]);

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
  const currentDraggingChapterontextValue = useMemo(() => {
    return {
      currentDraggingChapter,
    };
  }, [currentDraggingChapter]);

  const settersContextValue = useMemo(() => {
    return {
      setAllDecksState,
      setActiveId,
      setCurrentDraggingDeck,
      setCurrentDraggingCard,
      setAllCardsState,
      setCurrentDraggingChapter,
      setAllChaptersState,
    };
  }, []);

  return (
    <DndSettersContext.Provider value={settersContextValue}>
      <DndStateContext.Provider value={stateContextValue}>
        <DndFilterContext.Provider value={filterContextValue}>
          <DndActiveIdContext.Provider value={activeIdContextValue}>
            <DndCurrentDraggingDeckContext.Provider
              value={currentDraggingDeckContextValue}
            >
              <DndCurrentDraggingCardContext.Provider
                value={currentDraggingCardContextValue}
              >
                <DndCurrentDraggingChapterContext.Provider
                  value={currentDraggingChapterontextValue}
                >
                  {children}
                </DndCurrentDraggingChapterContext.Provider>
              </DndCurrentDraggingCardContext.Provider>
            </DndCurrentDraggingDeckContext.Provider>
          </DndActiveIdContext.Provider>
        </DndFilterContext.Provider>
      </DndStateContext.Provider>
    </DndSettersContext.Provider>
  );
};

export default DndContextProvider;
