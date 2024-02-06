import {
  FormEvent,
  useState,
  useRef,
  useContext,
  RefObject,
  memo,
  useEffect,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { AlertData, DeckType, DeckTypeWithIndex } from ".././types/types";
import useUndoDeck from "./../hooks/useUndoDeck";
import { Helmet } from "react-helmet";
import { UserContext } from "../context/UserContext";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";
import { searchContext } from "../context/SearchContext";
import useEditDeck from "../hooks/useEditDeck";
import { CustomError } from "../utils/customError";

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
  const { data: allDecks, error, isError, isLoading, isPaused } = useGetDecks();
  const navigate = useNavigate();
  const location = useLocation();
  const [openEditDeckModal, setOpenEditDeckModal] = useState<boolean>(false);
  // Here in createDeckResponse, you will receive the data that the server returns after the mutation.
  const {
    mutate: addDeck,
    isPending: isCreatingDeck,
    isSuccess: isDeckAdded,
    isError: isCreateDeckError,
    error: createDeckError,
    data: createDeckResponse,
    reset: resetCreateDeckResponse,
  } = useCreateDeck();

  const {
    theme,
    handleShowUserInfomation,
    divRefForUserSettings,
    showLogoutModal,
    setShowLogoutModal,
  } = useContext(UserContext);
  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const [animateCloseEditDeckModal, setAnimateCloseEditDeckModal] =
    useState(false);
  const {
    mutate: editDeck,
    isError: isEditDeckError,
    error: editDeckError,
    data: editDeckResponse,
    reset: resetEditDeckResponse,
  } = useEditDeck();
  const {
    mutate: pinDeck,
    error: pinDeckError,
    isError: isPinDeckError,
    data: pinDeckResponse,
    reset: resetPinDeckResponse,
  } = usePinDeck();
  const {
    mutate: undoDeckItem,
    error: undoDeckError,
    isError: isUndoDeckError,
    reset: resetUndoDeck,
  } = useUndoDeck();
  const { isOnline } = useContext(OfflineContext);
  // const deleteConfirmationModal=useRef<HTMLDivElement | null >(null)
  const showPopUp = useRef<HTMLDivElement | null>(null);
  const shouldPushStateRef = useRef<boolean>(false);

  const {
    showSearchBar,
    setOpenSearchBar,
    setAnimateCloseEditDeckModalInSearchResult,
    openEditDeckModalForSearchResult,
    cardDeleted,
    setCardDeleted,
  } = useContext(searchContext);
  const [wasSearchBarInitiallyTrue, setWasSearchBarInitiallyTrue] =
    useState(showSearchBar);

  const handleBrowsersBackButton = () => {
    if (showLogoutModal) {
      setShowLogoutModal(false);
      return;
    }
    if (openEditDeckModal) {
      setAnimateCloseEditDeckModal(true);
    }
    if (openEditDeckModalForSearchResult) {
      setAnimateCloseEditDeckModalInSearchResult(true);
      return;
    }
    if (showSearchBar) {
      if (divRefForUserSettings.current?.classList.contains("scale-100")) {
        handleShowUserInfomation();
      }
      setOpenSearchBar(false);
    }
  };

  useEffect(() => {
    if (isCreateDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: createDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetCreateDeckResponse();
    }
    if (isPinDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: pinDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetPinDeckResponse();
    }

    if (isEditDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: editDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetEditDeckResponse();
    }
    if (isUndoDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: undoDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetEditDeckResponse();
    }
  }, [isCreateDeckError, isEditDeckError, isPinDeckError, isUndoDeckError]);

  useEffect(() => {
    if (cardDeleted) {
      setCardDeleted(false);
    }
  }, []);

  useEffect(() => {
    if (openEditDeckModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openEditDeckModal]);
  useEffect(() => {
    const shouldPushState = showSearchBar || openEditDeckModal;
    openEditDeckModalForSearchResult;
    if (shouldPushState && !shouldPushStateRef.current) {
      if (!wasSearchBarInitiallyTrue) {
        window.history.pushState(
          { isBackButtonNotClicked: true },
          "",
          document.URL
        );
      } else {
        setWasSearchBarInitiallyTrue(false);
      }
    } else if (location?.state?.isBackButtonNotClicked) {
      navigate(-1);
    }

    const variableArray = [
      openEditDeckModal,
      showSearchBar,
      openEditDeckModalForSearchResult,
    ];
    const trueCount = variableArray.filter((variable) => variable).length;

    if (trueCount >= 2) {
      shouldPushStateRef.current = true;
    } else {
      shouldPushStateRef.current = false;
    }

    window.addEventListener("popstate", handleBrowsersBackButton);

    return () => {
      window.removeEventListener("popstate", handleBrowsersBackButton);
    };
  }, [
    openEditDeckModal,
    showSearchBar,
    openEditDeckModalForSearchResult,
    showLogoutModal,
  ]);

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

  useEffect(() => {
    // Find the element you want to scroll to
    const elementToScrollTo = document.getElementById(
      `${createDeckResponse?._id}`
    );

    // Calculate an offset to control the scrolling position
    const yOffset = -200;

    // Scroll to the element if found
    if (elementToScrollTo) {
      setTimeout(() => {
        elementToScrollTo.classList.add(
          "animate-[pulse_1s_ease-in-out_2]",
          "shadow-md",
          "shadow-violet-700",
          "border-violet-700"
        );
      }, 100);

      const y = elementToScrollTo.getBoundingClientRect().top + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });

      // Remove the classes after the animation has completed
      elementToScrollTo.addEventListener("animationend", () => {
        elementToScrollTo.classList.remove(
          "animate-[pulse_1s_ease-in-out_2]",
          "shadow-md",
          "shadow-violet-700",
          "border-violet-700"
        );
      });
    }
  }, [createDeckResponse]);

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
      showPopUp.current.classList.add("!w-[85%]");
      showPopUp.current.classList.add("md:!w-fit");
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

  if (isError || isPaused) {
    return (
      <ErrorDisplay
        theme={theme}
        message={error?.message}
        status={(error as CustomError)?.statusCode}
        isPaused={isPaused}
      >
        <button
          onClick={() => window.location.reload()}
          className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out "
          type="button"
          aria-label="Refresh"
        >
          Refresh
        </button>
      </ErrorDisplay>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>{showSearchBar ? "Search Results" : "Decks"}</title>
        <meta
          name="description"
          content="Organize and manage your information with ease using our customizable decks.create different decks to keep all your important information in one place."
        />
      </Helmet>
      <div className="flex flex-col gap-2 mt-8 mb-12 lg:mx-14 overflow-auto ">
        {
          <div
            ref={undoButtonRef}
            className=" transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800  rounded-lg z-50 dark:text-gray-50 p-4 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500  fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2"
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
          message="Drag and drop the deck onto the trash icon to delete it."
          ref={showPopUp}
        />
        <Droppable droppableId="DeckDeleteArea">
          {(provided, snapshot) => {
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
                    snapshot.isDraggingOver ? "-rotate-12" : "transform-none"
                  } `}
                  onClick={handlePopUp}
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
              className=" dark:bg-slate-900  dark:border-sky-400 dark:text-white lg:w-96 w-80 max-w-full py-1 border-2 border-teal-600 outline-none focus:border-teal-700 text-gray-700 px-2 mx-4 rounded-md"
              type="text"
              id="title"
            />
            <button
              className="bg-[#459C98] dark:bg-sky-600 dark:hover:bg-sky-700  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md transition-[background-color] duration-300"
              aria-label="Add Deck"
              type="submit"
            >
              Create Deck
            </button>
          </form>
        </div>

        {allDecks &&
        !("message" in allDecks && allDecks.message) &&
        allDecks?.filter((deck) => {
          return deck?.pinned === true;
        }).length > 0 ? (
          <section className="mt-4 lg:mb-10  mx-1  animate-opacity_page_transition">
            <h2 className="text-left  text-base font-semibold text-gray-800 dark:text-gray-50  my-4 mx-2 ">
              Pinned
            </h2>

            <Droppable droppableId="pinnedArea" isDropDisabled={true}>
              {(provided) => {
                return (
                  <div
                    className=" flex flex-row flex-wrap gap-2  justify-center items-center py-2 px-1 lg:mx-16 "
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
                     rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[11.8rem] sm:w-[10.9rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify  
                     transition-[border-color] duration-150  dark:hover:bg-slate-800 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] before:absolute hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]  hover:after:bg-gray-100 dark:hover:after:bg-slate-800 overflow-hidden before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 after:rounded-sm z-30`}
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                >
                                  <div className="z-40 w-full">
                                    <div className="absolute bottom-0 right-0">
                                      {/* <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button> */}

                                      <button
                                        onClick={() => {
                                          handleEditDeck(deck._id, deck.title);
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            handleShowUserInfomation();
                                          }
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
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            handleShowUserInfomation();
                                          }
                                        }}
                                        type="button"
                                        className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-500 hover:scale-95"
                                        aria-label="Pin Deck"
                                      >
                                        <BsFillPinFill className="text-[0.9rem]" />
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
                                            handleShowUserInfomation();
                                          }
                                        }}
                                        className=" break-all font-bold  line-clamp-1 h-7 text-center  w-full  "
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
          </section>
        ) : null}

        {allDecks &&
        !("message" in allDecks && allDecks.message) &&
        allDecks?.filter((deck) => {
          return deck?.pinned === false;
        }).length > 0 ? (
          <section className="mt-4 mb-24  mx-1 animate-opacity_page_transition">
            <h2 className="text-left text-base font-semibold text-gray-800  my-4 mx-2 dark:text-gray-50 ">
              {allDecks!?.filter((deck) => {
                return deck?.pinned === true;
              }).length > 0
                ? "Others"
                : "Decks"}
            </h2>

            <Droppable droppableId="othersDeckArea" isDropDisabled={true}>
              {(provided) => {
                return (
                  <div
                    className="  flex flex-row flex-wrap gap-2  justify-center items-center  py-2 px-1 lg:mx-14 "
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {allDecks
                      ?.filter((deck: DeckType) => deck.pinned === false)
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
                                  id={deck._id}
                                  className={`relative border  ${
                                    snapshot.isDragging
                                      ? " border-lime-500 animate-pulse  shadow-2xl shadow-lime-500 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-lime-500 before:to-lime-500 before:animate-rotate after:content-[''] after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 dark:text-lime-500 text-lime-500 before:!opacity-100 "
                                      : "border-gray-400 "
                                  } ${
                                    snapshot.draggingOver ===
                                      "DeckDeleteArea" &&
                                    " !border-red-500 !shadow-2xl !shadow-red-500   before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500 "
                                  } 
        text-gray-800 dark:text-gray-50  
                     rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[12rem] sm:w-[10.9rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify 
                     transition-[border-color] duration-150   overflow-hidden  before:absolute before:opacity-0 before:transition-all before:duration-300 after:rounded-sm z-30 ${
                       deck.isProcessing
                         ? "cursor-not-allowed"
                         : "dark:hover:bg-slate-800 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]   hover:after:bg-gray-100 dark:hover:after:bg-slate-800  hover:before:opacity-100"
                     }  `}
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                >
                                  <div className="z-40 flex w-full">
                                    {!deck.isProcessing && (
                                      <div className="absolute bottom-0 right-0 ">
                                        <button
                                          onClick={() => {
                                            handleEditDeck(
                                              deck._id,
                                              deck.title
                                            );
                                            if (
                                              divRefForUserSettings.current?.classList.contains(
                                                "scale-100"
                                              )
                                            ) {
                                              handleShowUserInfomation();
                                            }
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
                                            if (
                                              divRefForUserSettings.current?.classList.contains(
                                                "scale-100"
                                              )
                                            ) {
                                              handleShowUserInfomation();
                                            }
                                          }}
                                          type="button"
                                          className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-600 dark:text-red-500 hover:scale-95"
                                          aria-label="Pin Deck"
                                        >
                                          <BsPin className="text-[0.9rem]" />
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
                                          handleShowUserInfomation();
                                        }
                                      }}
                                      className={`  h-7  w-full flex items-center justify-center`}
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
                                          className={`text-center transition-opacity duration-700  cursor-pointer w-full break-all font-bold  line-clamp-1  ${
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
          </section>
        ) : null}

        {openEditDeckModal ? (
          <EditModalForDeck
            openEditDeckModal={openEditDeckModal}
            setOpenEditDeckModal={setOpenEditDeckModal}
            editData={editData}
            setEditData={setEditData}
            animateCloseEditDeckModal={animateCloseEditDeckModal}
            setAnimateCloseEditDeckModal={setAnimateCloseEditDeckModal}
            editDeck={editDeck}
          />
        ) : null}

        {allDecks?.length === 0 && (
          <div className="fixed w-full top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center  flex-col pt-[3.45rem]">
            <img
              src={`${
                theme === "dark"
                  ? "/illustrations/no_decks_found_dark.svg"
                  : "/illustrations/no_decks_found_light.svg"
              }`}
              alt="No decks found"
              className="w-56 h-44 lg:w-64 lg:h-52"
            />
            <p className="pb-1  text-base font-bold dark:text-gray-50 text-gray-800">
              Looks like you haven't added any decks yet.
            </p>
            <p className="p-1  text-base font-bold dark:text-gray-50 text-gray-800">
              Create a new deck to get started.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(Deck);
