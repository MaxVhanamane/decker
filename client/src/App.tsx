import {
  useContext,
  useRef,
  useState,
  lazy,
  Suspense,
  useEffect,
  useCallback,
} from "react";
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
import { DragDropContext, DropResult } from "react-beautiful-dnd";
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
import { ChangeBulbColor } from "./components/Bulb";
import PopUpMessage from "./components/PopUpMessage";
import useUndoDeck from "./hooks/useUndoDeck";
import useUndoCard from "./hooks/useUndoCard";
import { PopupContext } from "./context/PopupContext";
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
    reset: resetDeleteCardResponse,
    isError: isDeleteCardError,
    error: deleteCardError,
  } = useDeleteCard();

  const { setUserInfo, setIsAuthenticating } = useContext(UserContext);
  const {
    mutate: moveCard,
    reset: resetMoveCardResponse,
    isError: isMoveCardError,
    error: moveCardError,
  } = useMoveCard();
  const undoButtonRefForCard = useRef<HTMLDivElement | null>(null);

  const popupRef = useContext(PopupContext);
  const { setAlert } = useContext(AlertContext);
  const { isOnline } = useContext(OfflineContext);
  const navigate = useNavigate();
  const { handlePlayAudio, isPlayingAudioAllowed, pathnameForAudio } =
    useContext(AudioContext);
  const bulbRef = useRef<ChangeBulbColor>(null);
  const undoDeckDetailsRef = useRef(undoDeckDetails);
  // saving the reference of undoDeckDetails value in a ref because when I call a function handleUndoDeckButtonClick
  undoDeckDetailsRef.current = undoDeckDetails;
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
  const {
    mutate: undoDeckItem,

    isError: isUndoDeckError,
    reset: resetUndoDeckResponse,
  } = useUndoDeck();
  const {
    mutate: undoCardItem,
    isError: isUndoCardError,
    reset: resetUndoCardResponse,
  } = useUndoCard();

  const undoCardDetailsRef = useRef(undoCardDetails);
  //I am saving the reference of the undoCardDetails value in a ref because when I call the function popupRef.current?.show("Card deleted successfully!", 7000, "Undo", handleUndoCardButtonClick), the handleUndoCardButtonClick function contains an old value of undoCardDetails. This happens because, before calling popupRef.current?.show(), I update the value of undoCardDetails, and due to closure, the function handleUndoCardButtonClick retains the old value of undoCardDetails. To avoid this, I am using a reference to undoCardDetails in handleUndoCardButtonClick, so it will always have the latest value.
  undoCardDetailsRef.current = undoCardDetails;

  const resetUndoDeckDetailsValue = useCallback(
    (deck: DeckTypeWithIndex | null): void => {
      if (deck === null) {
        setUndoDeckDetails(null);
      } else {
        setUndoDeckDetails(deck);
      }
    },
    [setUndoDeckDetails]
  );

  const resetUndoCardDetailsValue = useCallback(
    (card: UndoCardPayloadData | null): void => {
      if (card === null) {
        setUndoCardDetails(null);
      } else {
        setUndoCardDetails(card);
      }
    },
    [setUndoCardDetails]
  );

  const handleUndoDeckButtonClick = useCallback(() => {
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
    undoDeckItem(undoDeckDetailsRef.current!, {
      onSettled: () => {
        // Once we undo the deck, we will set the state that was holding the deleted item to null.
        resetUndoDeckDetailsValue(null);
      },
    });
  }, [isOnline, setAlert, undoDeckItem, resetUndoDeckDetailsValue]);

  const handleUndoCardButtonClick = useCallback(() => {
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

    undoCardItem(undoCardDetailsRef.current!, {
      onSettled: () => {
        resetUndoCardDetailsValue(null);
      },
    });
  }, [
    undoCardItem,
    isOnline,
    undoCardDetailsRef,
    setAlert,
    resetUndoCardDetailsValue,
  ]);

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
    if (isUndoDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message:
          "We're sorry, but we couldn't undo your deck due to a technical issue. Your deck may not be restored. We apologize for any inconvenience.",
        autoHideDuration: 5000,
      }));
      resetUndoDeckResponse();
    }
    if (isUndoCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message:
          "We're sorry, but we couldn't undo your card due to a technical issue. Your card may not be restored. We apologize for any inconvenience.",
        autoHideDuration: 7000,
      }));
      resetUndoCardResponse();
    }
    if (isDeleteCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: deleteCardError?.message,
        autoHideDuration: 5000,
      }));
      resetDeleteCardResponse();
    }
  }, [isDeleteDeckError, isUndoDeckError, isUndoCardError, isDeleteCardError]);

  const handleChange = async (result: DropResult) => {
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
        resetUndoDeckDetailsValue,
      };
      deleteDeckMutation(data, {
        onSuccess: () => {
          popupRef.current?.show(
            "Deck deleted successfully!",
            7000,
            "Undo",
            handleUndoDeckButtonClick
          );
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
            popupRef.current?.show(
              "Card deleted successfully!",
              7000,
              "Undo",
              handleUndoCardButtonClick
            );

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
        onDragEnd={(result: DropResult) => {
          if (bulbRef?.current?.colorName === "fuchsia") {
            bulbRef?.current?.resetBulbColor("fuchsia");
            bulbRef.current.colorName = "";
          } else if (bulbRef?.current?.colorName === "lime") {
            bulbRef?.current?.resetBulbColor("lime");
            bulbRef.current.colorName = "";
          } else if (bulbRef?.current?.colorName === "red") {
            bulbRef?.current?.resetBulbColor("fuchsia");
            bulbRef?.current?.resetBulbColor("lime");
            bulbRef?.current?.resetBulbColor("red");
            bulbRef.current.colorName = "";
          }

          //To avoid calling the function (handleChange) unnecessarily, we will first check if dropableId is present and if it is not equal to bulbArea. If the user drops over bulbArea, I have no actions to take; it is just there to add a swing to a bulb.
          if (
            result?.destination?.droppableId === "bulbArea" ||
            !result?.destination?.droppableId
          ) {
            return;
          }
          handleChange(result);
        }}
      >
        <ShowAlert />
        <ErrorBoundary>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<Deck bulbRef={bulbRef} />} />
              <Route
                path="/cards/:deck_id"
                element={
                  <Suspense fallback={<Loading />}>
                    <Cards
                      undoCardDetails={undoCardDetails}
                      resetUndoCardDetailsValue={resetUndoCardDetailsValue}
                      undoButtonRefForCard={undoButtonRefForCard}
                      resetMoveCardResponse={resetMoveCardResponse}
                      moveCardError={moveCardError}
                      isMoveCardError={isMoveCardError}
                      setUndoCardDetails={setUndoCardDetails}
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
      <PopUpMessage />
    </>
  );
}

export default App;
