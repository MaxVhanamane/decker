// import { UndoCardPayloadData } from "../../types/types";
// import { useCallback, useContext, useEffect, useRef } from "react";
// import { DndSettersContext } from "../../context/DndItemContext";
// import useDeleteCard from "../react-query/useDeleteCard";
// import { ShowToastContext } from "../../context/ToastNotificationContext";
// import { OfflineContext } from "../../context/OfflineContext";
// import useUndoCard from "../react-query/useUndoCard";
// import { Descendant } from "slate";

// type CardDeletionParams = {
//     deckId: string,
//     deletionIndex: number,
//     cardInfo: {
//         note: Descendant[];
//         cardId: string;
//         createdAt: string;
//     }
// };

// const useDeleteCardUtility = () => {

//     const { showToast } = useContext(ShowToastContext);

//     const { isOnline } = useContext(OfflineContext);

//     const undoCardDataRef = useRef<null | UndoCardPayloadData>(null)
//     const {
//         mutate: deleteCardMutation,
//         reset: resetDeleteCardResponse,
//         isError: isDeleteCardError,
//         error: deleteCardError,
//     } = useDeleteCard();
//     const {
//         mutate: undoCardItem,
//         isError: isUndoCardError,
//         reset: resetUndoCardResponse,
//     } = useUndoCard();



//     useEffect(() => {
//         if (isUndoCardError) {
//             showToast({
//                 message:
//                     "We're sorry, but we couldn't undo your card due to a technical issue. Your card may not be restored. We apologize for any inconvenience.",
//                 severity: "error",
//                 autoHideDuration: 7000,
//                 position: "top-center",
//                 animationStyle: "scale-up",
//                 theme: "auto",
//             });

//             resetUndoCardResponse();
//         }
//         if (isDeleteCardError) {
//             showToast({
//                 message: deleteCardError?.message,
//                 severity: "error",
//                 autoHideDuration: 5000,
//                 position: "top-center",
//                 animationStyle: "scale-up",
//                 theme: "auto",
//             });

//             resetDeleteCardResponse();
//         }
//     }, [isUndoCardError, isDeleteCardError, showToast, resetDeleteCardResponse, resetUndoCardResponse, deleteCardError]);


//     const handleUndoCardButtonClick = () => {
//         if (!isOnline) {
//             showToast({
//                 message: "No internet connection",
//                 severity: "error",
//                 autoHideDuration: 5000,
//                 position: "top-center",
//                 animationStyle: "scale-up",
//                 theme: "auto",
//             });

//             return;
//         }
//         undoCardItem(undoCardDataRef.current!);
//     };


//     const deleteCard = useCallback(async ({ deckId, deletionIndex, cardInfo }: CardDeletionParams) => {

//         undoCardDataRef.current = {
//             deckId,
//             content: cardInfo,
//             index: deletionIndex,
//         }


//         deleteCardMutation(
//             {
//                 deckId,
//                 index: deletionIndex,
//                 toastButtonHandler: handleUndoCardButtonClick
//             },

//         );

//     }, [deleteCardMutation])


//     return { deleteCard }
// }

// export { useDeleteCardUtility }
