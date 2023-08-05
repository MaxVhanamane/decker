import { useContext, useRef, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AlertData, DeckTypeWithIndex } from "./types/types";
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
// Lazy load the components
const AuthFailure = lazy(() => import("./pages/AuthFailure"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const SessionExpired = lazy(() => import("./pages/SessionExpired"));
const DeleteMyAccount = lazy(() => import("./pages/DeleteMyAccount"));
const SignUp = lazy(() => import("./pages/Signup"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Cards = lazy(() => import("./pages/Cards"));
const AccountDeletionSuccess = lazy(
  () => import("./pages/AccountDeletionSuccess")
);
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
// putting timout variable outside of the function so that It will be created only once not on each render
// So that when I use clearTimeout(timeout) It will clear the right timeout variable(instance).
let timeout: NodeJS.Timeout;

function App() {
  // add this to prompt for a refresh
  if ("serviceWorker" in navigator) {
    useRegisterSW();
  }

  const [undoDeck, setUndoDeck] = useState<DeckTypeWithIndex | null>(null);
  const { theme } = useContext(UserContext);
  const { mutate: deleteOneDeck, isError: deleteDeckMutationError } =
    useDeleteDeck();
  const { deleteConfirmationModalForCard, setIndexOfCardForDeletion } =
    useContext(UserContext);
  const { mutate: moveCard } = useMoveCard();
  const undoButtonRef = useRef<HTMLDivElement | null>(null);
  const { setAlert } = useContext(AlertContext);
  const { isOnline } = useContext(OfflineContext);

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

  const handleUndoDeck = (deck: DeckTypeWithIndex | null): void => {
    if (deck === null) {
      setUndoDeck(null);
    } else {
      setUndoDeck({ ...deck });
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
      deleteOneDeck(data);
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
      setIndexOfCardForDeletion(cardToDeleteIndex);
      if (
        deleteConfirmationModalForCard?.current?.classList.contains("hidden")
      ) {
        deleteConfirmationModalForCard?.current?.classList.remove("hidden");
      }
    } else if (result.destination?.droppableId == "cardDropableArea") {
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
      let deleteIndex = result.source.index;
      let moveIndex = result.destination.index;
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

  // Initially when page loads there is no theme value set it will be null but when useEffect mounts it sets the theme value according to systems
  // theme value. but before useEffect mounts It shows light theme. If users system is set to dark mode. then he will see light mode for a second when page loads. to avoid that we will wait for theme value to set first then will render the Ui.
  if (!theme) {
    return <Loading />;
  }

  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult, provided: ResponderProvided) => {
          handleChange(result, provided);
        }}
      >
        <ShowAlert />

        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route
              path="/"
              element={
                <Deck
                  undoDeck={undoDeck}
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
                  <Cards />
                </Suspense>
              }
            />
            <Route
              path="/cards/:deck_id/:search_index"
              element={
                <Suspense fallback={<Loading />}>
                  <Cards />
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
          <Route
            path="/verifyemail"
            element={
              <Suspense fallback={<Loading />}>
                <VerifyEmail />
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
      </DragDropContext>
    </>
  );
}

export default App;
