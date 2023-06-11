import { useContext, useRef, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { DeckTypeWithIndex } from "./types/types";
import useMoveCard from "./hooks/useMoveCard";
import { UserContext } from "./context/UserContext";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import useDeleteDeck from "./hooks/useDeleteDeck";
import Loading from "./components/Loading";
import AuthSuccess from "./pages/AuthSuccess";
import ShowAlert from "./components/ShowAlert";

// Lazy load the components
const Deck = lazy(() => import("./pages/Deck"));
const Cards = lazy(() => import("./pages/Cards"));
const SignUp = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const PrivateRoutes = lazy(() => import("./components/PrivateRoutes"));
const AuthFailure = lazy(() => import("./pages/AuthFailure"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const SessionExpiredPage = lazy(() => import("./pages/SessionExpiredPage"));
const DeleteMyAccount = lazy(() => import("./pages/DeleteMyAccount"));
const AccountDeletionSuccess = lazy(
  () => import("./pages/AccountDeletionSuccess")
);
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
// putting timout variable outside of the function so that It will be created only once not on each render
// So that when I use clearTimeout(timeout) It will clear the right timeout variable(instance).
let timeout: NodeJS.Timeout;

function App() {
  const [undoDeck, setUndoDeck] = useState<DeckTypeWithIndex | null>(null);
  const { theme } = useContext(UserContext);
  const { mutate: deleteOneDeck } = useDeleteDeck();
  const { deleteConfirmationModalForCard, setIndexOfCardForDeletion } =
    useContext(UserContext);
  const {
    mutate: moveCard,
    error: editMutationError,
    isError: isEditMutationError,
  } = useMoveCard();
  const undoButtonRef = useRef<HTMLDivElement | null>(null);

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
    // if (result.destination?.droppableId === "pinnedArea") {
    //   pinDeck({ id: result.draggableId, pinned: true });
    // } else if (result.destination?.droppableId === "othersDeckArea") {
    //   pinDeck({ id: result.draggableId, pinned: false });
    // } else
    if (result.destination?.droppableId == "DeckDeleteArea") {
      let data = {
        _id: result.draggableId,
        handleUndoDeck,
      };
      deleteOneDeck(data);
      // If user deletes decks one after the another that creates problem because when user deletes second deck
      // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.
      if (undoButtonRef.current?.classList.contains("scale-0")) {
        // undoButtonRef?.current?.classList.remove("scale-100")
        // undoButtonRef?.current?.classList.add("scale-0")
        // undoButtonRef?.current?.classList.add("hidden")
        handlePopupForUndoButton();
      } else {
        clearTimeout(timeout);
        undoButtonRef?.current?.classList.remove("scale-100");

        undoButtonRef?.current?.classList.add("scale-0");
        undoButtonRef?.current?.classList.add("hidden");
        handlePopupForUndoButton();
      }
    } else if (result.destination?.droppableId == "cardDeleteArea") {
      let cardToDeleteIndex = result.source.index;
      setIndexOfCardForDeletion(cardToDeleteIndex);
      if (
        deleteConfirmationModalForCard?.current?.classList.contains("hidden")
      ) {
        deleteConfirmationModalForCard?.current?.classList.remove("hidden");
      }
    } else if (result.destination?.droppableId == "cardDropableArea") {
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
                <Suspense fallback={<Loading />}>
                  <Deck
                    undoDeck={undoDeck}
                    handleUndoDeck={handleUndoDeck}
                    undoButtonRef={undoButtonRef}
                    handlePopupForUndoButton={handlePopupForUndoButton}
                  />
                </Suspense>
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
            <Route path="/cards/:deck_id/:search_index" element={<Cards />} />
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
          <Route
            path="/login"
            element={
              <Suspense fallback={<Loading />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/sessionexpired"
            element={
              <Suspense fallback={<Loading />}>
                <SessionExpiredPage />
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
          <Route
            path="*"
            element={
              <Suspense fallback={<Loading />}>
                <PageNotFound />
              </Suspense>
            }
          />
          <Route path="/auth/success" element={<AuthSuccess />} />
        </Routes>
      </DragDropContext>
    </>
  );
}

export default App;
