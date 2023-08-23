import { Dispatch, MouseEvent, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { searchContext } from "../../context/SearchContext";
interface IProp {
  deck_id: string;
  indexOfCardForDeletion: number;
  deleteCardItem: (payload: { deck_id: string; index: number }) => void;
  setShowFullScreen?: Dispatch<React.SetStateAction<boolean>>;
}
const ConfirmDeleteModalForCard = ({
  deck_id,
  indexOfCardForDeletion,
  deleteCardItem,
  setShowFullScreen,
}: IProp) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteConfirmationModalForCard } = useContext(UserContext);
  const { showSearchBar } = useContext(searchContext);
  const getUserConfirmation = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    const payload = { deck_id: deck_id!, index: indexOfCardForDeletion! };
    if ((e.target as HTMLButtonElement).id === "yesbutton") {
      deleteCardItem(payload);
      deleteConfirmationModalForCard?.current?.classList.add("hidden");
      if (setShowFullScreen) {
        setShowFullScreen(false);
      }
      if (showSearchBar) {
        // If the showSearchBar is true and the user clicks on the delete button, after deleting we will take them back to the page they came from. To get the previous URL, we can use 'location.state?.from', which we set in the Link tag.
        if (location.state?.from === "/") {
          navigate("/");
        } else {
          navigate(location.state?.from);
        }
      }
    } else {
      deleteConfirmationModalForCard?.current?.classList.add("hidden");
    }
  };

  return (
    <div
      ref={deleteConfirmationModalForCard}
      id="popup-modal"
      tabIndex={-1}
      className="fixed hidden z-[90] p-4 overflow-x-hidden overflow-y-auto inset-0 backdrop-blur-xl dark:lg:bg-slate-950 lg:backdrop-blur-none lg:bg-white"
    >
      <div className="relative w-full h-full flex items-center justify-center  ">
        <div className="relative bg-white rounded-lg shadow-md dark:shadow-md shadow-teal-500 dark:shadow-sky-500 dark:bg-slate-950 ring-1 ring-sky-500  ">
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
              className="text-gray-500 bg-white hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModalForCard;
