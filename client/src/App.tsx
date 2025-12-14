import { useEffect, memo } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { DndContext } from "@dnd-kit/core";
import MemoizedRoutes from "./components/MemoizedRoutes";
import DragOverlayComponent from "./components/DragOverlayComponent";
import { useCustomSensors } from "./hooks/utility/useCustomSensors";
import { useLocation } from "react-router-dom";
import useDragHandlers from "./features/drag-and-drop/hooks/useDragHandlers";
import useUser from "./hooks/utility/useUser";
import { useCustomCollisionDetection } from "./features/drag-and-drop/hooks/useCustomCollisionDetection";
const autoScroll = {
  threshold: { x: 0, y: 0.1 },
  acceleration: 3,
  enabled: true,
  layoutShiftCompensation: false,
  canScroll: (element: Element) => {
    // Prevent scrolling on html, body,
    if (element === document.documentElement || element === document.body) {
      return false;
    }

    return true;
  },
};
const isFirefox = /firefox/i.test(navigator.userAgent);

function App() {
  const shouldRegisterSW = "serviceWorker" in navigator && !isFirefox;
  useRegisterSW({ immediate: shouldRegisterSW });
  const customCollisionDetection = useCustomCollisionDetection();
  const location = useLocation();
  const sensors = useCustomSensors();
  const { getUser } = useUser();
  const {
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleOnDragEnd,
    handleDragCancel,
  } = useDragHandlers();

  useEffect(() => {
    // As I am storing the user's email in the state, when the user reloads the page, we will lose that email because I am only storing the username and profile picture in localStorage, as the email is considered sensitive information. Therefore, making this request on page load is necessary to retrieve the user's email.
    if (!(location.pathname === "/auth/success")) {
      getUser();
    }
  }, []);

  return (
    <>
      <DndContext
        collisionDetection={customCollisionDetection}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleOnDragEnd}
        autoScroll={autoScroll}
        onDragAbort={handleDragCancel}
        onDragCancel={handleDragCancel}
      >
        <MemoizedRoutes />

        <DragOverlayComponent />
      </DndContext>
    </>
  );
}

export default memo(App);

// export function useTraceUpdate<T extends Record<string, any>>(props: T): void {
//   const prev = useRef<T>(props);

//   useEffect(() => {
//     const changedProps = Object.entries(props).reduce<
//       Record<string, { previous: any; current: any }>
//     >((acc, [key, value]) => {
//       if (prev.current[key] !== value) {
//         acc[key] = {
//           previous: prev.current[key],
//           current: value,
//         };
//       }
//       return acc;
//     }, {});

//     if (Object.keys(changedProps).length > 0) {
//       console.group("Component re-rendered due to state/context changes");
//       Object.entries(changedProps).forEach(([key, { previous, current }]) => {
//         console.log(
//           `Property "${key}" changed from:`,
//           previous,
//           "to:",
//           current
//         );
//       });
//       console.groupEnd();
//     }

//     // Update the ref with the new values for the next render comparison
//     prev.current = props;
//   }, [props]);
// }

// useTraceUpdate({
//   deleteCard, // track deleteCard mutation
//   moveCard, // track moveCard mutation
//   resetMoveCardResponse, // track reset function for moveCard
//   isMoveCardError, // track isError state for moveCard
//   moveCardError, // track error for moveCard
//   reorderDeck, // track reorderDeck mutation
//   showToast, // track showToast context value
//   isOnline, // track isOnline context value
//   handlePlayAudio, // track handlePlayAudio context value
//   bulbRef, // track bulbRef context value
//   undoDeckDetailsRef: undoDeckDetailsRef.current, // track ref value for undoDeckDetails
//   undoDeckItem, // track undoDeckItem mutation
//   isUndoDeckError, // track isError state for undoDeckItem
//   resetUndoDeckResponse, // track reset function for undoDeckItem
//   setAllDecksState, // track setAllDecksState context value
//   setCurrentDraggingCard, // track setCurrentDraggingCard context value
//   setAllCardsState, // track setAllCardsState context value
//   setCurrentDraggingDeck, // track setCurrentDraggingDeck context value
//   setDeckIdToFilterOnDragOverDeleteArea, // track setDeckIdToFilterOnDragOverDeleteArea context value
//   currentDraggingDeck, // track currentDraggingDeck context value
//   currentDraggingCard, // track currentDraggingCard context value
//   sensors, // track custom sensors value
//   // More state or context values to track
//   setUserInfo,
//   setUserEmailAddress,
//   undoButtonRefForCard,
//   navigate,
// });
