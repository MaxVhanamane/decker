import {
  FormEvent,
  useState,
  useRef,
  useContext,
  RefObject,
  memo,
  useEffect,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { BsPin } from "react-icons/bs";
import { BsFillPinFill } from "react-icons/bs";
import useGetDecks from "../hooks/useGetDecks";
import useCreateDeck from "../hooks/useCreateDeck";
import usePinDeck from "../hooks/usePinDeck";
import { AlertContext } from "../context/AlertContext";
import EditModalForDeck from "../components/EditModalForDeck";
import { BiEdit } from "react-icons/bi";
import Loading from "../components/Loading";
import PopUpMessage from "../components/PopUpMessage";
import { AlertData, AxiosErrorType, DeckTypeWithIndex } from ".././types/types";
import useUndoDeck from "./../hooks/useUndoDeck";
import { Helmet } from "react-helmet";
import SessionExpired from "../components/SessionExpired";
import { UserContext } from "../context/UserContext";
import { OfflineContext } from "../context/OfflineContext";
import useGetDecksAndCardsCache from "../hooks/useGetDecksAndCardsCache";
type PropType = {
  undoDeck: DeckTypeWithIndex | null;
  handleUndoDeck: (deck: DeckTypeWithIndex | null) => void;
  undoButtonRef: RefObject<HTMLDivElement>;
  handlePopupForUndoButton: () => void;
};

function Deck({
  undoDeck,
  handleUndoDeck,
  undoButtonRef,
  handlePopupForUndoButton,
}: PropType) {
  const { setAlert } = useContext(AlertContext);
  const inputRefElement = useRef<HTMLInputElement>(null);
  const { data: allDecks, error, isError, isLoading } = useGetDecks();
  const navigate = useNavigate();
  const [openEditDeckModal, setOpenEditDeckModal] = useState<boolean>(false);
  const { mutate: addDeck, isLoading: isCreatingDeck } = useCreateDeck();
  // Calling decks-and-cards to cache the data so that users can search offline.
  useGetDecksAndCardsCache();
  const { theme, divRefForUserSettings } = useContext(UserContext);
  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const {
    mutate: pinDeck,
    error: pinError,
    isError: isPinError,
  } = usePinDeck();
  const {
    mutate: undoDeckItem,
    error: undoError,
    isError: isUndoError,
  } = useUndoDeck();
  const { isOnline } = useContext(OfflineContext);
  // const deleteConfirmationModal=useRef<HTMLDivElement | null >(null)
  const showPopUp = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    //If I don't use trim(), user can create the deck using white spaces. the trim() method is used to remove any leading and trailing white spaces from the string str.
    e.preventDefault();

    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }

    if (inputRefElement.current!.value.trim().length > 0) {
      addDeck(inputRefElement.current!.value);
      inputRefElement.current!.value = "";
    } else {
      inputRefElement.current!.value = "";
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "The deck title should be at least one character long.",
      }));
    }
  };

  const handlePin = async (id: string, pinned: boolean) => {
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    pinDeck({ id, pinned: !pinned });
  };

  const handleEditDeck = (deck_id: string, title: string) => {
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    setEditData({ ...editData, deck_id, title });
    setOpenEditDeckModal(true);
  };

  const handlePopUp = () => {
    if (showPopUp.current?.classList.contains("scale-0")) {
      showPopUp.current.classList.remove("scale-0");
      showPopUp?.current?.classList.add("!block");
      showPopUp.current.classList.add("!w-fit");
      showPopUp.current.classList.add("!h-fit");
      showPopUp.current.classList.add("scale-100");

      setTimeout(() => {
        showPopUp?.current?.classList.remove("scale-100");
        showPopUp?.current?.classList.add("scale-0");
        showPopUp?.current?.classList.add("hidden");
      }, 3000);
    }
  };

  const handleUndo = () => {
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    // I have set the value of undoDeck state in useDeleteDeck()
    undoDeckItem(undoDeck!);
    // Once we undo the deck, we will set the state that was holding the deleted item to null so that when we delete another item, it can hold that fresh data.
    handleUndoDeck(null);
    // calling handlePopupForUndoButton() function so that it can close the dialog box when we click on undo button.
    handlePopupForUndoButton();
  };

  if (allDecks?.message) {
    return <SessionExpired />;
  }

  if (isError) {
    const axiosError = error as AxiosErrorType;
    if (axiosError?.message?.includes("Network Error")) {
      return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-4">
          <img
            src={`${
              theme === "dark"
                ? "/illustrations/no_internet_dark.svg"
                : "/illustrations/no_internet_light.svg"
            }`}
            alt="No internet "
            className="w-28 h-28 "
          />
          <p className="font-semibold text-md"> No internet connection.</p>
          <button
            onClick={() => window.location.reload()}
            className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
            type="button"
            aria-label="Refresh"
          >
            Refresh
          </button>
        </div>
      );
    } else if (axiosError?.response?.status === 500) {
      return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2">
          <img
            src={`${
              theme === "dark"
                ? "/illustrations/server_down_dark.svg"
                : "/illustrations/server_down_light.svg"
            }`}
            alt="Server down "
            className=" w-40 h-36 "
          />
          <div className="font-semibold text-md">
            <p> An error occurred on the server.</p>
            <p> Please try again later.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out   "
            type="button"
            aria-label="Refresh"
          >
            Refresh
          </button>
        </div>
      );
    } else {
      const errorMessage =
        axiosError?.response?.data?.message ||
        "An error occurred. Please try again later.";
      return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2">
          <img
            src={`${
              theme === "dark"
                ? "/illustrations/error_dark.svg"
                : "/illustrations/error_light.svg"
            }`}
            alt="Error "
            className=" w-40 h-40 "
          />
          <p className="font-semibold text-md"> {errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out "
            type="button"
            aria-label="Refresh"
          >
            Refresh
          </button>
        </div>
      );
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>Decks</title>
        <meta
          name="description"
          content="Organize and manage your information with ease using our customizable decks.create different decks to keep all your important information in one place."
        />
      </Helmet>
      <div className="flex flex-col gap-2 mt-8 mb-24 lg:mx-32 ">
        {
          <div
            ref={undoButtonRef}
            className=" transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800  rounded-lg z-50 dark:text-gray-50 p-4 dark:bg-[#0c1221] border shadow dark:border-sky-500 dark:shadow-sky-500  fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2"
          >
            <span className="mr-4">Deck deleted successfully!</span>
            <span
              className="cursor-pointer font-bold text-blue-700 dark:text-yellow-400"
              onClick={() => {
                handleUndo();
              }}
            >
              Undo
            </span>
          </div>
        }
        <PopUpMessage
          message="Drag and drop the deck here to delete it."
          showPopUp={showPopUp}
        />
        <Droppable droppableId="DeckDeleteArea">
          {(provided, snapshot) => {
            return (
              <div
                className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${
                  snapshot.isDraggingOver
                    ? "ring-1 ring-red-500 shadow-md shadow-red-500"
                    : "ring-1 dark:ring-sky-500/40 ring-teal-500/40"
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div
                  className={` cursor-pointer transition-transform duration-300 ${
                    snapshot.isDraggingOver ? "-rotate-12" : "transform-none"
                  } `}
                  onClick={handlePopUp}
                  title="Drag and drop the deck here to delete it."
                >
                  {snapshot.isDraggingOver ? (
                    <img
                      src="/trashcan-open.svg"
                      alt="Delete deck trash can "
                      className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]"
                    />
                  ) : (
                    <img
                      src="/trashcan-close.svg"
                      alt="Delete deck trash can "
                      className="w-[30px] h-[30px]  lg:w-[35px] lg:h-[35px]"
                    />
                  )}
                </div>
              </div>
            );
          }}
        </Droppable>

        <div className="w-full px-4 mx-auto ">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <label
              htmlFor="title"
              className="font-bold text-teal-700 dark:text-sky-400 "
            >
              Deck title
            </label>
            <input
              ref={inputRefElement}
              className=" dark:bg-[#0c1221] dark:border-sky-400 dark:text-white lg:w-96 w-80 py-1 border-2 border-teal-600 outline-none focus:border-teal-700 text-gray-700 px-2 mx-4 rounded-md"
              type="text"
              id="title"
            />
            <button
              className="bg-[#459C98] dark:bg-sky-600 dark:hover:bg-sky-700  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md transition-[background-color] duration-300"
              aria-label="Add Deck"
            >
              Create Deck
            </button>
          </form>
        </div>

        {allDecks!?.filter((deck) => {
          return deck?.pinned === true;
        }).length > 0 ? (
          <div className="mt-4 lg:mb-10  mx-1  ">
            <h1 className="text-left  text-md font-semibold text-gray-800 dark:text-gray-50  my-4 mx-2 ">
              Pinned
            </h1>

            <Droppable droppableId="pinnedArea" isDropDisabled={true}>
              {(provided) => {
                return (
                  <div
                    className=" flex flex-row flex-wrap gap-2  justify-center items-center py-2 px-1 lg:mx-20 "
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {allDecks
                      ?.filter((deck) => deck.pinned === true)
                      .map((deck, index) => {
                        return (
                          <Draggable
                            draggableId={deck._id}
                            index={index}
                            key={deck._id}
                            shouldRespectForcePress
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  className={`relative border  ${
                                    snapshot.isDragging
                                      ? " border-yellow-400 animate-pulse  shadow-2xl shadow-yellow-400 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-yellow-500 before:to-yellow-400 before:animate-rotate after:content-[''] after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 dark:text-yellow-500 text-yellow-500 before:!opacity-100 "
                                      : "border-gray-400 "
                                  } ${
                                    snapshot.draggingOver ===
                                      "DeckDeleteArea" &&
                                    " !border-red-500 !shadow-2xl !shadow-red-500   before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500 "
                                  } 
        text-gray-800 dark:text-gray-50  
                     rounded-md w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify  
                     transition-[background-color,border-color] duration-100  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] before:absolute hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]  hover:after:bg-gray-100 dark:hover:after:bg-slate-900 overflow-hidden before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 after:rounded-sm z-30`}
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                >
                                  <div className="z-40">
                                    <div className="absolute bottom-0 right-0">
                                      {/* <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button> */}

                                      <button
                                        onClick={() => {
                                          handleEditDeck(deck._id, deck.title);
                                        }}
                                        type="button"
                                        className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                        aria-label="Edit Deck"
                                      >
                                        <BiEdit />
                                      </button>
                                      <button
                                        onClick={() => {
                                          handlePin(deck._id, deck.pinned);
                                        }}
                                        type="button"
                                        className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-500 hover:scale-95"
                                        aria-label="Pin Deck"
                                      >
                                        <BsFillPinFill />
                                      </button>
                                    </div>
                                    <Link to={`cards/${deck._id}`}>
                                      <p
                                        onClick={() => {
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            divRefForUserSettings.current?.classList.remove(
                                              "scale-100"
                                            );
                                            divRefForUserSettings.current?.classList.add(
                                              "scale-0"
                                            );
                                            divRefForUserSettings.current?.classList.add(
                                              "hidden"
                                            );
                                          }
                                        }}
                                        className=" break-all font-bold  line-clamp-1 h-7 text-center  "
                                      >
                                        {deck.title}
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
        ) : null}

        {allDecks!?.filter((deck) => {
          return deck?.pinned === false;
        }).length > 0 ? (
          <div className="mt-4 mb-24  mx-1">
            <h1 className="text-left text-md font-semibold text-gray-800  my-4 mx-2 dark:text-gray-50 ">
              {allDecks!?.filter((deck) => {
                return deck?.pinned === true;
              }).length > 0
                ? "Others"
                : "Decks"}
            </h1>

            <Droppable droppableId="othersDeckArea" isDropDisabled={true}>
              {(provided) => {
                return (
                  <div
                    className="  flex flex-row flex-wrap gap-2  justify-center items-center  py-2 px-1 lg:mx-20 "
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {allDecks
                      ?.filter((deck) => deck.pinned === false)
                      .map((deck, index) => {
                        return (
                          <Draggable
                            draggableId={deck._id}
                            index={index + 500}
                            key={deck._id}
                            isDragDisabled={deck.isProcessing}
                          >
                            {(provided, snapshot) => {
                              return (
                                <div
                                  className={`relative border  ${
                                    snapshot.isDragging
                                      ? " border-yellow-400 animate-pulse  shadow-2xl shadow-yellow-400 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-yellow-500 before:to-yellow-400 before:animate-rotate after:content-[''] after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 dark:text-yellow-500 text-yellow-500 before:!opacity-100 "
                                      : "border-gray-400 "
                                  } ${
                                    snapshot.draggingOver ===
                                      "DeckDeleteArea" &&
                                    " !border-red-500 !shadow-2xl !shadow-red-500   before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500 "
                                  } 
        text-gray-800 dark:text-gray-50  
                     rounded-md w-[10.5rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify 
                     transition-[background-color,border-color] duration-100   overflow-hidden  before:absolute before:opacity-0 before:transition-all before:duration-300 after:rounded-sm z-30 ${
                       deck.isProcessing
                         ? "cursor-not-allowed"
                         : "dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]   hover:after:bg-gray-100 dark:hover:after:bg-slate-900  hover:before:opacity-100"
                     } `}
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                >
                                  <div className="z-40 flex">
                                    {!deck.isProcessing && (
                                      <div className="absolute bottom-0 right-0 ">
                                        <button
                                          onClick={() => {
                                            handleEditDeck(
                                              deck._id,
                                              deck.title
                                            );
                                          }}
                                          type="button"
                                          className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                          aria-label="Edit Deck"
                                        >
                                          <BiEdit />
                                        </button>

                                        <button
                                          onClick={() => {
                                            handlePin(deck._id, deck.pinned);
                                          }}
                                          type="button"
                                          className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-600 dark:text-red-500 hover:scale-95"
                                          aria-label="Pin Deck"
                                        >
                                          <BsPin />
                                        </button>
                                      </div>
                                    )}

                                    <div
                                      onClick={() => {
                                        if (
                                          !isCreatingDeck &&
                                          !deck.isProcessing
                                        ) {
                                          navigate(`cards/${deck._id}`);
                                        }
                                        if (
                                          divRefForUserSettings.current?.classList.contains(
                                            "scale-100"
                                          )
                                        ) {
                                          divRefForUserSettings.current?.classList.remove(
                                            "scale-100"
                                          );
                                          divRefForUserSettings.current?.classList.add(
                                            "scale-0"
                                          );
                                          divRefForUserSettings.current?.classList.add(
                                            "hidden"
                                          );
                                        }
                                      }}
                                      className={` break-all font-bold  line-clamp-1 h-7 text-center `}
                                    >
                                      {deck.isProcessing ? (
                                        <svg
                                          className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-100"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <p
                                          className={`transition-opacity duration-700 ${
                                            deck.isProcessing
                                              ? "opacity-0"
                                              : "opacity-100"
                                          }`}
                                        >
                                          {deck.title}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
        ) : null}

        {openEditDeckModal ? (
          <EditModalForDeck
            openEditDeckModal={openEditDeckModal}
            setOpenEditDeckModal={setOpenEditDeckModal}
            editData={editData}
            setEditData={setEditData}
          />
        ) : null}

        {allDecks?.length === 0 && (
          <div className="fixed w-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center  flex-col">
            <img
              src={`${
                theme === "dark"
                  ? "/illustrations/no_decks_found_dark.svg"
                  : "/illustrations/no_decks_found_light.svg"
              }`}
              alt="No decks found"
              className="w-56 h-40 "
            />
            <p className="pb-1  text-md font-bold dark:text-gray-50 text-gray-800">
              Looks like you haven't added any decks yet.
            </p>
            <p className="p-1  text-md font-bold dark:text-gray-50 text-gray-800">
              Create a new deck to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(Deck);
