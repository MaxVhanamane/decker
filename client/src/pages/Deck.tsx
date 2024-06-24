import {
  FormEvent,
  useState,
  useRef,
  useContext,
  RefObject,
  memo,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import useGetDecks from "../hooks/useGetDecks";
import useCreateDeck from "../hooks/useCreateDeck";
import usePinDeck from "../hooks/usePinDeck";
import { AlertContext } from "../context/AlertContext";
import EditModalForDeck from "../components/EditModalForDeck";
import Loading from "../components/Loading";
import { AlertData } from ".././types/types";
import { Helmet } from "react-helmet";
import { ThemeContext, UserContext } from "../context/UserContext";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";
import { searchContext } from "../context/SearchContext";
import useEditDeck from "../hooks/useEditDeck";
import { CustomError } from "../utils/customError";
import { AudioContext } from "../context/AudioContext";
import Bulb, { ChangeBulbColor } from "../components/Bulb";
import DeckItems from "../components/deck/DeckItems";
import DeckCreationForm from "../components/deck/DeckCreationForm";
import TrashCanDropZone from "../components/TrashCanDropZone";

type PropType = {
  bulbRef: RefObject<ChangeBulbColor>;
};

function Deck({ bulbRef }: PropType) {
  const { setAlert } = useContext(AlertContext);
  const inputRefElement = useRef<HTMLInputElement>(null);
  const { data: allDecks, error, isError, isLoading, isPaused } = useGetDecks();
  const navigate = useNavigate();
  const [openEditDeckModal, setOpenEditDeckModal] = useState<boolean>(false);
  // Here in createDeckResponse, you will receive the data that the server returns after the mutation.
  const {
    mutate: addDeck,
    isPending: isCreatingDeck,
    isError: isCreateDeckError,
    error: createDeckError,
    data: createDeckResponse,
    reset: resetCreateDeckResponse,
  } = useCreateDeck();

  const {
    showLogoutModal,
    setShowLogoutModal,
    handleShowUserInfomation,
    divRefForUserSettings,
  } = useContext(UserContext);

  const { theme } = useContext(ThemeContext);
  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const [animateCloseEditDeckModal, setAnimateCloseEditDeckModal] =
    useState(false);
  const {
    mutate: editDeck,
    isError: isEditDeckError,
    error: editDeckError,

    reset: resetEditDeckResponse,
  } = useEditDeck();
  const {
    mutate: pinDeck,
    error: pinDeckError,
    isError: isPinDeckError,

    reset: resetPinDeckResponse,
  } = usePinDeck();

  const { isOnline } = useContext(OfflineContext);
  const { handlePlayAudio, isPlayingAudioAllowed } = useContext(AudioContext);
  const shouldPushStateRef = useRef<boolean>(false);

  const radialGradientOverlayRef = useRef<HTMLDivElement | null>(null);

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
  }, [isCreateDeckError, isEditDeckError, isPinDeckError]);

  useEffect(() => {
    if (cardDeleted) {
      setCardDeleted(false);
    }
  }, [cardDeleted]);

  useEffect(() => {
    // To avoid a weird cut in the modal bottom, we will set overflow to hidden when edit modal is open. This is because on mobile phones, when the address bar hides and shows when you scroll, it changes the height of the screen, causing the layout to sometimes shift weirdly.
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
    } else if (window?.history?.state?.isBackButtonNotClicked) {
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

  const isPinnedDeckAvailable = useMemo(() => {
    return allDecks ? !!allDecks?.find((deck) => deck?.pinned === true) : false;
  }, [allDecks]);

  const isUnPinnedDeckAvailable = useMemo(() => {
    return allDecks
      ? !!allDecks?.find((deck) => deck?.pinned === false)
      : false;
  }, [allDecks]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
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
        addDeck(inputRefElement.current!.value, {
          onSuccess: () => {
            if (isPlayingAudioAllowed) {
              setTimeout(() => {
                handlePlayAudio("createdSuccessfully", "/");
              }, 100);
            }
          },
        });
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
    },
    [isOnline, inputRefElement, addDeck, isPlayingAudioAllowed, handlePlayAudio]
  );

  useEffect(() => {
    // Find the element you want to scroll to
    const elementToScrollTo = document.getElementById(
      `${createDeckResponse?._id}`
    );
    const overlayElement = radialGradientOverlayRef?.current;
    // Calculate an offset to control the scrolling position
    const yOffset = -200;

    // Scroll to the element if found
    if (elementToScrollTo) {
      setTimeout(() => {
        elementToScrollTo.classList.add(
          "animate-[pulse_1.5s_ease-in-out_2]",
          "shadow-shadow-4-sides",
          "shadow-violet-700",
          "border-violet-700",
          "!text-violet-700",
          "hover:shadow-none",
          "dark:hover:border-violet-700",
          "hover:border-violet-700"
        );
        overlayElement?.classList.add(
          "after:!bg-[radial-gradient(#6d28d9,#0c7bb3e6)]",
          "after:opacity-100"
        );
      }, 100);

      // Get the bounding box of the element
      const elementRect = elementToScrollTo.getBoundingClientRect();

      // Check if the element is already in the viewport
      if (
        elementRect.top >= 0 &&
        elementRect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight)
      ) {
        // Element is already in view, no need to scroll
        // Remove the classes after the animation has completed
        elementToScrollTo.addEventListener("animationend", () => {
          elementToScrollTo.classList.remove(
            "animate-[pulse_1.5s_ease-in-out_2]",
            "shadow-shadow-4-sides",
            "shadow-violet-700",
            "border-violet-700",
            "!text-violet-700",
            "hover:shadow-none",
            "dark:hover:border-violet-700",
            "hover:border-violet-700"
          );
          overlayElement?.classList.remove(
            "after:!bg-[radial-gradient(#6d28d9,#0c7bb3e6)]",
            "after:opacity-100"
          );
        });
      } else {
        // Calculate the target scroll position
        const targetScrollPosition = elementRect.top + window.scrollY + yOffset;

        // Scroll to the target position
        window.scrollTo({ top: targetScrollPosition, behavior: "smooth" });

        // Remove the classes after the animation has completed
        elementToScrollTo.addEventListener("animationend", () => {
          elementToScrollTo.classList.remove(
            "animate-[pulse_1.5s_ease-in-out_2]",
            "shadow-shadow-4-sides",
            "shadow-violet-700",
            "border-violet-700",
            "!text-violet-700",
            "hover:shadow-none",
            "dark:hover:border-violet-700",
            "hover:border-violet-700"
          );
          overlayElement?.classList.remove(
            "after:!bg-[radial-gradient(#6d28d9,#0c7bb3e6)]",
            "after:opacity-100"
          );
        });
      }
      resetCreateDeckResponse();
    }
  }, [createDeckResponse]);

  const handlePin = useCallback(
    async (id: string, pinned: boolean) => {
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
    },
    [isOnline, pinDeck]
  );

  const handleEditDeck = useCallback(
    (deck_id: string, title: string) => {
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
    },
    [isOnline, editData]
  );

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
      <div className="flex flex-col gap-2 mt-8 mb-12 lg:mx-14  ">
        <Bulb ref={bulbRef} />

        <TrashCanDropZone
          bulbRef={bulbRef}
          droppableId="DeckDeleteArea"
          altText="Trash can for deleting deck"
        />

        <DeckCreationForm handleSubmit={handleSubmit} ref={inputRefElement} />

        {allDecks &&
        !("message" in allDecks && allDecks.message) &&
        isPinnedDeckAvailable ? (
          <DeckItems
            bulbRef={bulbRef}
            allDecks={allDecks}
            handlePin={handlePin}
            handleEditDeck={handleEditDeck}
            heading="Pinned"
          />
        ) : null}

        {allDecks &&
        !("message" in allDecks && allDecks.message) &&
        isUnPinnedDeckAvailable ? (
          <DeckItems
            bulbRef={bulbRef}
            allDecks={allDecks}
            handlePin={handlePin}
            handleEditDeck={handleEditDeck}
            heading={isPinnedDeckAvailable ? "Others" : "Decks"}
            radialGradientOverlayRef={radialGradientOverlayRef}
            isCreatingDeck={isCreatingDeck}
          />
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
