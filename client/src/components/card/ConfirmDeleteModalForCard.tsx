import { Dispatch, MouseEvent, memo, useContext, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { searchContext } from "../../context/SearchContext";
import { UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import {
  CardDataType,
  CardsDataType,
  DeckAndCardType,
  UndoCardPayloadData,
} from "../../types/types";
import { CustomError } from "../../utils/customError";
import { AudioContext } from "../../context/AudioContext";
import { CardContext } from "../../context/CardContext";
import { PopupContext } from "../../context/PopupContext";

type DeleteCardPayloadType = {
  deck_id: string;
  index: number;
};
type SuccessResponseType = {
  success: boolean;
};

interface IProp {
  indexOfCardForDeletion: number;
  deleteCardItem: UseMutateFunction<
    CustomError | SuccessResponseType,
    Error,
    DeleteCardPayloadType,
    {
      previousCardQueryData: CardDataType[] | undefined;
      previousCardAndDeckQueryData: DeckAndCardType[] | undefined;
    }
  >;
  setIsConfirmDeleteModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setWasDeleteModalOpen: Dispatch<React.SetStateAction<boolean>>;
  showFullScreen: boolean;
  setUndoCardDetails?: Dispatch<
    React.SetStateAction<UndoCardPayloadData | null>
  >;
  undoButtonRefForCard?: React.RefObject<HTMLDivElement>;
  timeoutForUndoCard?: NodeJS.Timeout;
  handleUndoButtonClick?: () => void;
}
const ConfirmDeleteModalForCard = ({
  indexOfCardForDeletion,
  deleteCardItem,
  setIsConfirmDeleteModalOpen,
  setWasDeleteModalOpen,
  showFullScreen,
  setUndoCardDetails,
  undoButtonRefForCard,
  handleUndoButtonClick,
}: IProp) => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useContext(PopupContext);
  const { deleteConfirmationModalForCard } = useContext(CardContext);
  const { showSearchBar } = useContext(searchContext);
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  const { deck_id } = useParams();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const getUserConfirmation = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    const payload = { deck_id: deck_id!, index: indexOfCardForDeletion! };

    if ((e.target as HTMLButtonElement).id === "yesbutton") {
      setDeleting(true);

      if (!showSearchBar) {
        const cardInfo = queryClient.getQueryData<CardsDataType>([
          "cards",
          deck_id,
        ]);
        if (cardInfo && "cards" in cardInfo) {
          const cardInformation = cardInfo?.cards?.[indexOfCardForDeletion];
          if (setUndoCardDetails) {
            setUndoCardDetails({
              deck_id: deck_id!,
              content: cardInformation,
              index: indexOfCardForDeletion,
            });
          }
        }
      }

      deleteCardItem(payload, {
        onSuccess: () => {
          // If user deletes cards one after the another that creates problem because when user deletes second card
          // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.

          if (!showSearchBar && undoButtonRefForCard && popupRef) {
            popupRef.current?.show(
              "Card deleted successfully!",
              7000,
              "Undo",
              handleUndoButtonClick
            );
          }

          if (isPlayingAudioAllowed) {
            setTimeout(() => {
              handlePlayAudio("deletedSuccessfully");
            }, 100);
          }
        },
        onSettled: () => {
          setDeleting(false);

          deleteConfirmationModalForCard?.current?.classList.add("hidden");
          setIsConfirmDeleteModalOpen(false);

          // This is for when user opens card and deletes it from there
          if (showFullScreen && !showSearchBar) {
            // When a user opens the card in full screen, I push a new entry into the browser stack. Then, when the user clicks on the delete button, I push another entry into the browser stack. When the user deletes that card, I have to remove those two pushed entries. To remove them, I use two navigate(-1) calls.
            navigate(-1);
            navigate(-1);
            return;
          }
          // This is for when user deletes card from /cards page and he uses delete button from there and he is not looking the card in fullscreen
          if (!showFullScreen) {
            navigate(-1);
            return;
          }
          // This is for when user deletes card when searchbar is open
          if (showSearchBar) {
            // If the showSearchBar is true and the user clicks on the delete button, after deleting we will take them back to the page they came from.
            navigate(location.pathname, {
              state: { deleted: true },
              replace: true,
            });
          }
        },
      });
    } else {
      deleteConfirmationModalForCard?.current?.classList.add("hidden");
      setIsConfirmDeleteModalOpen(false);
      setWasDeleteModalOpen(true);
      if (window?.history?.state?.isBackButtonNotClicked) {
        navigate(-1);
      }
    }
  };

  return (
    <div
      ref={deleteConfirmationModalForCard}
      id="popup-modal"
      tabIndex={-1}
      className="fixed hidden z-[90] p-4 overflow-x-hidden overflow-y-auto inset-0 backdrop-blur-xl dark:bg-slate-900 lg:backdrop-blur-none lg:bg-[#fcfefc] "
    >
      <div className="relative w-full h-full flex items-center justify-center  ">
        <div className="relative bg-[#fcfefc] rounded-lg shadow-md dark:shadow-md shadow-teal-500 dark:shadow-sky-500 dark:bg-slate-900 ring-1 ring-sky-500  ">
          <div className="p-6 text-center">
            <svg
              aria-hidden="true"
              className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="mb-5 text-lg font-normal">
              <h3 className="  text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this card?
              </h3>
              <p className="text-red-500">
                {showSearchBar && "you can not undo this action"}
              </p>
            </div>
            <div className="h-12">
              {!deleting ? (
                <div>
                  <button
                    id="yesbutton"
                    aria-label="Yes,I'm sure"
                    onClick={getUserConfirmation}
                    type="button"
                    className="text-white bg-red-600 hover:bg-red-800 transition-colors duration-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none"
                  >
                    Yes, I'm sure
                  </button>
                  <button
                    id="nobutton"
                    aria-label="No, cancel"
                    onClick={getUserConfirmation}
                    type="button"
                    className="text-gray-500 bg-[#fcfefc] hover:bg-gray-100 transition-colors duration-300  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none"
                  >
                    No, cancel
                  </button>
                </div>
              ) : (
                <div className=" flex items-center justify-center gap-2 py-2.5">
                  <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
                  <p
                    className={`  ${
                      localStorage.getItem("theme") === "dark" ||
                      localStorage.getItem("theme") === null
                        ? "text-gray-200"
                        : "text-gray-700"
                    }`}
                  >
                    Deleting...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ConfirmDeleteModalForCard);
