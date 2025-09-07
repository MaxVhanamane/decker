import { useContext, memo, useMemo } from "react";
import type { DeckType } from "../../types/types";
import { UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { DndFilterContext } from "../../context/DndItemContext";
import SortableDeckItem from "./SortableDeckItem";

type PropTypes = {
  allDecks: DeckType[];
  handleEditDeck: (deckId: string, title: string) => void;
  handlePin: (deckId: string, pinned: boolean) => Promise<void>;
  heading: string;
};

const DeckItemsContainer = memo(
  ({ allDecks, handleEditDeck, handlePin, heading }: PropTypes) => {
    const { deckIdToFilterOnDragOverDeleteArea } = useContext(DndFilterContext);
    //I have to use useDeleteDeckUtility here and pass it down as a prop to the component that needs it because when the user deletes an item, the item gets removed from the DOM. As a result, the onSuccess and onSettled functions written inside useDeleteDeckUtility()—which are additional callbacks—won't run. This is how React Query works; the component should be mounted for these additional callbacks to execute. However, the onSuccess, onSettled, and other functions inside useMutation will always run, even if the component unmounts.

    0;
    const items = useMemo(() => {
      let items: { id: UniqueIdentifier }[];
      if (deckIdToFilterOnDragOverDeleteArea) {
        items = allDecks
          .filter((deck) => deck.deckId !== deckIdToFilterOnDragOverDeleteArea)
          .map((item) => ({
            id: item.deckId,
          }));
      } else {
        items = allDecks.map((item) => ({
          id: item.deckId,
        }));
      }

      return items;
    }, [allDecks, deckIdToFilterOnDragOverDeleteArea]);

    return (
      <section
        className={` ${
          heading !== "Pinned" ? "mb-20" : "lg:mb-10"
        } mx-1  animate-opacity_page_transition w-full`}
      >
        <SortableContext
          items={items}
          strategy={rectSortingStrategy}
          id={heading}
          key={heading}
        >
          <div className="w-full flex items-center justify-center flex-col">
            <h2 className="text-left w-full text-sm  text-gray-800 dark:text-gray-50  my-4 mx-2  px-4 lg:w-[80rem]">
              {heading}
            </h2>
            <div className=" flex flex-row flex-wrap gap-2 justify-center items-center py-2 sm:px-1 lg:w-[80rem] transition-all duration-1000">
              {allDecks
                ?.filter(
                  (deck) => deck.deckId !== deckIdToFilterOnDragOverDeleteArea
                )
                .map((deck) => {
                  return (
                    <SortableDeckItem
                      deck={deck}
                      handleEditDeck={handleEditDeck}
                      handlePin={handlePin}
                      key={deck.deckId}
                    />
                  );
                })}
            </div>
          </div>
        </SortableContext>
      </section>
    );
  }
);
DeckItemsContainer.displayName = "DeckItemsContainer";
export default DeckItemsContainer;
