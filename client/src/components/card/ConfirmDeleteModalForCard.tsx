import { Dispatch, MouseEvent, memo, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { searchContext } from "../../context/SearchContext";
interface IProp {
  indexOfCardForDeletion: number;
  deleteCardItem: (payload: { deck_id: string; index: number }) => void;
  setShowFullScreen?: Dispatch<React.SetStateAction<boolean>>;
  setIsConfirmDeleteModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setWasDeleteModalOpen: Dispatch<React.SetStateAction<boolean>>;
  showFullScreen: boolean;
}
const ConfirmDeleteModalForCard = ({
  indexOfCardForDeletion,
  deleteCardItem,
  setShowFullScreen,
  setIsConfirmDeleteModalOpen,
  setWasDeleteModalOpen,
  showFullScreen,
}: IProp) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteConfirmationModalForCard } = useContext(UserContext);
  const { showSearchBar } = useContext(searchContext);
  const { deck_id } = useParams();
  const getUserConfirmation = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    const payload = { deck_id: deck_id!, index: indexOfCardForDeletion! };

    if ((e.target as HTMLButtonElement).id === "yesbutton") {
      deleteCardItem(payload);
      deleteConfirmationModalForCard?.current?.classList.add("hidden");
      setIsConfirmDeleteModalOpen(false);
      //  As setShowFullScreen is an optional prop that is why I have put in a If statement to avoid ts error.
      if (setShowFullScreen) {
        setShowFullScreen(false);
      }
      // This is for when user opens card and deletes it from there
      if (showFullScreen && !showSearchBar) {
        // When a user opens the card in full screen, I push a new entry into the browser stack. Then, when the user clicks on the delete button, I push another entry into the browser stack. When the user deletes that card, I have to remove those two pushed entries. To remove them, I use two navigate(-1) calls.
        navigate(-1);
        navigate(-1);
      }
      // This is for when user deletes card from /cards page and he uses delete button from thier and he is not looking the card in fullscreen
      if (!showFullScreen) {
        navigate(-1);
      }
      // This is for when user deletes card when searchbar is open
      if (showSearchBar) {
        // If the showSearchBar is true and the user clicks on the delete button, after deleting we will take them back to the page they came from. To get the previous URL, we can use 'location.state?.from', which we set in the Link tag.
        navigate(location.pathname, { state: { deleted: true } });
      }
    } else {
      deleteConfirmationModalForCard?.current?.classList.add("hidden");
      setIsConfirmDeleteModalOpen(false);
      setWasDeleteModalOpen(true);
      if (location?.state?.isBackButtonNotClicked) {
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
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this card?
            </h3>
            <button
              id="yesbutton"
              aria-label="Yes,I'm sure"
              onClick={getUserConfirmation}
              data-modal-toggle="popup-modal"
              type="button"
              className="text-white bg-red-600 hover:bg-red-800    font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none"
            >
              Yes, I'm sure
            </button>
            <button
              id="nobutton"
              aria-label="No, cancel"
              onClick={getUserConfirmation}
              data-modal-toggle="popup-modal"
              type="button"
              className="text-gray-500 bg-[#fcfefc] hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ConfirmDeleteModalForCard);
