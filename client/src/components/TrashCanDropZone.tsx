import { RefObject, memo, useContext } from "react";
import { Droppable } from "react-beautiful-dnd";
import { ChangeBulbColor } from "./Bulb";
import { PopupContext } from "../context/PopupContext";

type PropType = {
  bulbRef?: RefObject<ChangeBulbColor>;
  droppableId: string;
  altText: string;
};

const TrashCanDropZone = memo(({ bulbRef, droppableId, altText }: PropType) => {
  const popupRef = useContext(PopupContext);
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => {
        if (snapshot.isDraggingOver) {
          bulbRef?.current?.setBulbColor("red");
        } else {
          if (bulbRef?.current?.colorName === "red") {
            bulbRef?.current?.resetBulbColor("red");
          }
        }
        return (
          <div
            className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700    lg:right-2 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${
              snapshot.isDraggingOver
                ? "ring-1 ring-red-500 shadow-md shadow-red-500 z-[5001]"
                : "ring-1 dark:ring-sky-500/40 ring-teal-500/40"
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div
              className={` cursor-pointer transition-transform duration-300 ${
                snapshot.isDraggingOver ? "-rotate-12 " : "transform-none"
              } `}
              onClick={() => {
                if (popupRef) {
                  if (droppableId === "DeckDeleteArea") {
                    popupRef.current?.show(
                      "Drag and drop the deck onto the trash icon to delete it.",
                      5000
                    );
                  } else {
                    popupRef.current?.show(
                      "Drag and drop the card onto the trash icon to delete it.",
                      5000
                    );
                  }
                }
              }}
            >
              {snapshot.isDraggingOver ? (
                <img
                  src="/trashcan-open.svg"
                  alt={altText}
                  className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]"
                />
              ) : (
                <img
                  src="/trashcan-close.svg"
                  alt={altText}
                  className="w-[30px] h-[30px]  lg:w-[35px] lg:h-[35px]"
                />
              )}
            </div>
          </div>
        );
      }}
    </Droppable>
  );
});

export default TrashCanDropZone;
