import { useContext, useRef, useState, lazy, Suspense, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  AlertData,
  CardsDataType,
  DeckTypeWithIndex,
  UndoCardPayloadData,
} from "./types/types";
import useMoveCard from "./hooks/useMoveCard";
import { UserContext } from "./context/UserContext";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import useDeleteDeck from "./hooks/useDeleteDeck";
import Loading from "./components/Loading";
import AuthSuccess from "./pages/AuthSuccess";
import ShowAlert from "./components/ShowAlert";
import Deck from "./pages/Deck";
import PrivateRoutes from "./components/PrivateRoutes";
import Login from "./pages/Login";
import { AlertContext } from "./context/AlertContext";
import { OfflineContext } from "./context/OfflineContext";
import CheckAuth from "./components/CheckAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { request } from "./utils/fetch-utils";
import { CustomError } from "./utils/customError";
import { AudioContext } from "./context/AudioContext";
import useDeleteCard from "./hooks/useDeleteCard";
import { useQueryClient } from "@tanstack/react-query";
// Lazy load the components
const AuthFailure = lazy(() => import("./pages/AuthFailure"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const SessionExpired = lazy(() => import("./pages/SessionExpired"));
const DeleteMyAccount = lazy(() => import("./pages/DeleteMyAccount"));
const SignUp = lazy(() => import("./pages/Signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Cards = lazy(() => import("./pages/Cards"));
const SearchResultCardFullScreenView = lazy(
  () => import("./pages/SearchResultCardFullScreenView")
);
const AccountDeletionSuccess = lazy(
  () => import("./pages/AccountDeletionSuccess")
);
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
// putting timout variable outside of the function so that It will be created only once not on each render
// So that when I use clearTimeout(timeout) It will clear the right timeout variable(instance).
let timeout: NodeJS.Timeout;
let timeoutForUndoCard: NodeJS.Timeout;
const isFirefox = /firefox/i.test(navigator.userAgent);

function App() {
  // add this to prompt for a refresh
  if ("serviceWorker" in navigator && !isFirefox) {
    useRegisterSW();
  }
  const [undoDeckDetails, setUndoDeckDetails] =
    useState<DeckTypeWithIndex | null>(null);
  const [undoCardDetails, setUndoCardDetails] =
    useState<UndoCardPayloadData | null>(null);
  const {
    mutate: deleteDeckMutation,
    error: deleteDeckError,
    isError: isDeleteDeckError,
    reset: resetDeleteDeckResponse,
  } = useDeleteDeck();
  const {
    mutate: deleteCardMutation,
    error: deleteCardError,
    isError: isDeleteCardError,
    reset: resetDeleteCardResponse,
  } = useDeleteCard();

  const {
    deleteConfirmationModalForCard,
    setIndexOfCardForDeletion,
    setUserInfo,
    setIsAuthenticating,
  } = useContext(UserContext);
  const {
    mutate: moveCard,
    reset: resetMoveCardResponse,
    isError: isMoveCardError,
    error: moveCardError,
  } = useMoveCard();
  const undoButtonRef = useRef<HTMLDivElement | null>(null);
  const undoButtonRefForCard = useRef<HTMLDivElement | null>(null);
  const { setAlert } = useContext(AlertContext);
  const { isOnline } = useContext(OfflineContext);
  const navigate = useNavigate();
  const { handlePlayAudio, isPlayingAudioAllowed, pathnameForAudio } =
    useContext(AudioContext);
  const pathNames = [
    "/signup",
    "/verifyemail",
    "/forgotpassword",
    "/changepassword",
    "/login",
    "/accountdeletionsuccess",
  ];
  const authPaths = ["/auth/success", "/auth/failure"];
  const queryClient = useQueryClient();
  const getUser = async (): Promise<void> => {
    try {
      const data = await request.get("/getuser");
      if (data.data) {
        setUserInfo(data.data);
      } else if (pathNames.includes(location.pathname)) {
        navigate(location.pathname);
      } else if (authPaths.includes(location.pathname)) {
        navigate("/login");
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (
        (error as CustomError)?.message ===
        "Your session has expired. Please log in again to continue."
      ) {
        setUserInfo(null);
        navigate("/login");
        return;
      }
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "An error occurred. Please try logging in again.",
        autoHideDuration: 5000,
      }));
      setIsAuthenticating(false);
      navigate("/login");
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!(location.pathname === "/auth/success")) {
      getUser();
    }
  }, []);

  useEffect(() => {
    if (isDeleteDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: deleteDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetDeleteDeckResponse();
    }
  }, [isDeleteDeckError]);
  const handlePopupForUndoButton = () => {
    if (undoButtonRef.current?.classList.contains("scale-0")) {
      undoButtonRef.current.classList.remove("scale-0");
      undoButtonRef?.current?.classList.add("!block");
      undoButtonRef.current.classList.add("!w-[19rem]");
      undoButtonRef.current.classList.add("!h-fit");
      undoButtonRef.current.classList.add("scale-100");

      timeout = setTimeout(() => {
        undoButtonRef?.current?.classList.remove("scale-100");
        undoButtonRef?.current?.classList.add("scale-0");
        undoButtonRef?.current?.classList.add("hidden");
      }, 7000);
    } else if (undoButtonRef?.current?.classList.contains("scale-100")) {
      clearTimeout(timeout);
      undoButtonRef.current.classList.add("scale-0");
      undoButtonRef?.current?.classList.add("hidden");
      undoButtonRef.current.classList.remove("scale-100");
    }
  };

  const handlePopupForUndoButtonForCard = () => {
    if (undoButtonRefForCard.current?.classList.contains("scale-0")) {
      undoButtonRefForCard.current.classList.remove("scale-0");
      undoButtonRefForCard?.current?.classList.add("!block");
      undoButtonRefForCard.current.classList.add("!w-[19rem]");
      undoButtonRefForCard.current.classList.add("!h-fit");
      undoButtonRefForCard.current.classList.add("scale-100");

      timeoutForUndoCard = setTimeout(() => {
        undoButtonRefForCard?.current?.classList.remove("scale-100");
        undoButtonRefForCard?.current?.classList.add("scale-0");
        undoButtonRefForCard?.current?.classList.add("hidden");
      }, 7000);
    } else if (undoButtonRefForCard?.current?.classList.contains("scale-100")) {
      clearTimeout(timeoutForUndoCard);
      undoButtonRefForCard.current.classList.add("scale-0");
      undoButtonRefForCard?.current?.classList.add("hidden");
      undoButtonRefForCard.current.classList.remove("scale-100");
    }
  };

  const handleUndoDeck = (deck: DeckTypeWithIndex | null): void => {
    if (deck === null) {
      setUndoDeckDetails(null);
    } else {
      setUndoDeckDetails(deck);
    }
  };

  const handleUndoCard = (card: UndoCardPayloadData | null): void => {
    if (card === null) {
      setUndoCardDetails(null);
    } else {
      setUndoCardDetails(card);
    }
  };

  const handleChange = async (
    result: DropResult,
    provided: ResponderProvided
  ) => {
    if (result.destination?.droppableId == "DeckDeleteArea") {
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
      let data = {
        _id: result.draggableId,
        handleUndoDeck,
        timeout,
        undoButtonRef,
        handlePopupForUndoButton,
      };
      deleteDeckMutation(data, {
        onSuccess: () => {
          if (isPlayingAudioAllowed) {
            pathnameForAudio.current = location.pathname;
            setTimeout(() => {
              handlePlayAudio("deletedSuccessfully", "/");
            }, 100);
          }
        },
      });
    } else if (result.destination?.droppableId == "cardDeleteArea") {
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

      let cardToDeleteIndex = result.source.index;
      let deck_id = result.draggableId.split("-")[0];

      const cardInfo = queryClient.getQueryData<CardsDataType>([
        "cards",
        deck_id,
      ]);

      if (cardInfo && "cards" in cardInfo) {
        const cardInformation = cardInfo?.cards?.[cardToDeleteIndex];
        // Delete the _id field from the card because the server will generate a new _id when it adds the card back.
        setUndoCardDetails({
          deck_id,
          content: cardInformation,
          index: cardToDeleteIndex,
        });
        const cardToDelete = {
          deck_id,
          index: cardToDeleteIndex,
        };
        deleteCardMutation(cardToDelete, {
          onSuccess: () => {
            // If user deletes cards one after the another that creates problem because when user deletes second card
            // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.
            if (undoButtonRefForCard.current?.classList.contains("scale-0")) {
              handlePopupForUndoButtonForCard();
            } else {
              clearTimeout(timeoutForUndoCard);
              undoButtonRefForCard?.current?.classList.remove("scale-100");
              undoButtonRefForCard?.current?.classList.add("scale-0");
              undoButtonRefForCard?.current?.classList.add("hidden");
              handlePopupForUndoButtonForCard();
            }

            if (isPlayingAudioAllowed) {
              setTimeout(() => {
                handlePlayAudio("deletedSuccessfully", "/cards");
              }, 100);
            }
          },
        });
      }
    } else if (result.destination?.droppableId == "cardDropableArea") {
      let deleteIndex = result.source.index;
      let moveIndex = result.destination.index;
      if (deleteIndex === moveIndex) return;
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

      const receivedData = result.draggableId.split("-");
      const id = receivedData[0];
      let data = {
        deleteIndex,
        moveIndex,
        deck_id: id,
      };
      moveCard(data);
    }
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult, provided: ResponderProvided) => {
          //To avoid calling the function (handleChange) unnecessarily, we will first check if dropableId is present and if it is not equal to bulbArea. If the user drops over bulbArea, I have no actions to take; it is just there to add a swing to a bulb.
          if (
            result?.destination?.droppableId === "bulbArea" ||
            !result?.destination?.droppableId
          ) {
            return;
          }
          handleChange(result, provided);
        }}
      >
        <ShowAlert />
        <ErrorBoundary>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route
                path="/"
                element={
                  <Deck
                    undoDeckDetails={undoDeckDetails}
                    handleUndoDeck={handleUndoDeck}
                    undoButtonRef={undoButtonRef}
                    handlePopupForUndoButton={handlePopupForUndoButton}
                  />
                }
              />
              <Route
                path="/cards/:deck_id"
                element={
                  <Suspense fallback={<Loading />}>
                    <Cards
                      handlePopupForUndoButtonForCard={
                        handlePopupForUndoButtonForCard
                      }
                      undoCardDetails={undoCardDetails}
                      handleUndoCard={handleUndoCard}
                      undoButtonRefForCard={undoButtonRefForCard}
                      resetMoveCardResponse={resetMoveCardResponse}
                      moveCardError={moveCardError}
                      isMoveCardError={isMoveCardError}
                      setUndoCardDetails={setUndoCardDetails}
                      timeoutForUndoCard={timeoutForUndoCard}
                    />
                  </Suspense>
                }
              />
              <Route
                path="/search/result/:deck_id/:search_index"
                element={
                  <Suspense fallback={<Loading />}>
                    <SearchResultCardFullScreenView />
                  </Suspense>
                }
              />
              <Route
                path="/account/deletemyaccount"
                element={
                  <Suspense fallback={<Loading />}>
                    <DeleteMyAccount />
                  </Suspense>
                }
              />
            </Route>
            {/*Added the <CheckAuth /> component to prevent flickering when a user visits these pages while logged in. */}
            <Route element={<CheckAuth />}>
              <Route
                path="/signup"
                element={
                  <Suspense fallback={<Loading />}>
                    <SignUp />
                  </Suspense>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/sessionexpired"
                element={
                  <Suspense fallback={<Loading />}>
                    <SessionExpired />
                  </Suspense>
                }
              />
              <Route
                path="/forgotpassword"
                element={
                  <Suspense fallback={<Loading />}>
                    <ForgotPassword />
                  </Suspense>
                }
              />
              <Route
                path="/changepassword"
                element={
                  <Suspense fallback={<Loading />}>
                    <ChangePassword />
                  </Suspense>
                }
              />

              <Route
                path="/verifyemail"
                element={
                  <Suspense fallback={<Loading />}>
                    <VerifyEmail />
                  </Suspense>
                }
              />
            </Route>

            <Route
              path="/auth/failure"
              element={
                <Suspense fallback={<Loading />}>
                  <AuthFailure />
                </Suspense>
              }
            />
            <Route
              path="/accountdeletionsuccess"
              element={
                <Suspense fallback={<Loading />}>
                  <AccountDeletionSuccess />
                </Suspense>
              }
            />

            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route
              path="*"
              element={
                <Suspense fallback={<Loading />}>
                  <PageNotFound />
                </Suspense>
              }
            />
          </Routes>
        </ErrorBoundary>
      </DragDropContext>
    </>
  );
}

export default App;
