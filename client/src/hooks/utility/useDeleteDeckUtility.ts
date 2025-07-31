// import { useCallback, useContext, useEffect } from "react";
// import { ShowToastContext } from "../../context/ToastNotificationContext";
// import useDeleteDeck from "../react-query/useDeleteDeck"
// import { OfflineContext } from "../../context/OfflineContext";
// import { AudioContext } from "../../context/AudioContext";
// import useUndoDeck from "../react-query/useUndoDeck";
// import { DeleteDeckPayload, UndoDeckType } from "../../types/types";


// const useDeleteDeckUtility = () => {
//     const { showToast } = useContext(ShowToastContext);
//     const { isOnline } = useContext(OfflineContext);
//     const { handlePlayAudio, isPlayingAudioAllowed } =
//         useContext(AudioContext);
//     const {
//         mutate: undoDeckItem,
//         isError: isUndoDeckError,
//         reset: resetUndoDeckResponse,
//     } = useUndoDeck();

//     const handleUndoDeckButtonClick = useCallback((undoDeckData: UndoDeckType) => {
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
//         undoDeckItem(undoDeckData);
//     }, [isOnline, undoDeckItem])

//     const {
//         mutate: deleteDeckMutation,
//         error: deleteDeckError,
//         isError: isDeleteDeckError,
//         reset: resetDeleteDeckResponse,
//     } = useDeleteDeck();

//     useEffect(() => {
//         if (isDeleteDeckError) {
//             showToast({
//                 message: deleteDeckError?.message,
//                 severity: "error",
//                 autoHideDuration: 5000,
//                 position: "top-center",
//                 animationStyle: "scale-up",
//                 theme: "auto",
//             });

//             resetDeleteDeckResponse();
//         }
//         if (isUndoDeckError) {
//             showToast({
//                 message:
//                     "We're sorry, but we couldn't undo your deck due to a technical issue. Your deck may not be restored. We apologize for any inconvenience.",
//                 severity: "error",
//                 autoHideDuration: 5000,
//                 position: "top-center",
//                 animationStyle: "scale-up",
//                 theme: "auto",
//             });

//             resetUndoDeckResponse();
//         }
//     }, [isDeleteDeckError, isUndoDeckError, resetDeleteDeckResponse, resetUndoDeckResponse, showToast]);



//     const deleteDeck = useCallback((payload: DeleteDeckPayload) => {

//         deleteDeckMutation(payload, {

//             onSuccess(data, _variables, context) {
//                 // We need the index of the deck here so that when we undo, we can insert it in the correct position during optimistic updates. You don't need the index for server-side data changes because the decks are sorted by the date field. If we provide the old date, it will automatically be placed in the correct index.
//                 if (data && "deletedDeckInfo" in data) {

//                     let deletedDeckInformation: UndoDeckType = {


//                         title: data?.deletedDeckInfo?.title,
//                         deckId: data?.deletedDeckInfo?.deckId,
//                         pinned: data?.deletedDeckInfo?.pinned,
//                         createdAt: data?.deletedDeckInfo?.createdAt,
//                         cardsCount: data?.deletedDeckInfo?.cardsCount,
//                         index: context?.indexOfDeletedDeck,
//                         indexOfDeletedDeckSearchResult: context?.indexOfDeletedDeckSearchResult,
//                         searchParams: context?.searchParams,

//                     }

//                     showToast({
//                         message: "Deck deleted successfully!",
//                         severity: "success",
//                         autoHideDuration: 7000,
//                         position: "bottom-right",
//                         buttonText: "Undo",
//                         buttonHandler: () => handleUndoDeckButtonClick(deletedDeckInformation),
//                     });
//                     if (isPlayingAudioAllowed) {
//                         setTimeout(() => {
//                             handlePlayAudio("deletedSuccessfully", "/");
//                         }, 100);
//                     }
//                 }
//             },

//         })
//     }, [deleteDeckMutation, showToast, handleUndoDeckButtonClick, handlePlayAudio, isPlayingAudioAllowed])

//     return { deleteDeck }
// }

// export { useDeleteDeckUtility }
