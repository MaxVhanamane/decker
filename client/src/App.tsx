import "./App.css";
import { lazy, Suspense, useContext } from "react";
import Deck from "./pages/Deck";
import { Routes, Route } from "react-router-dom";
// import Cards from "./pages/Cards";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import usePinDeck from "./hooks/usePinDeck";
import useDeleteDeck from "./hooks/useDeleteDeck";
// import NotFound from "./componenets/NotFound";
// import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import PrivateRoutes from "./components/PrivateRoutes";
import Layout from "./components/Layout";
import AuthSuccess from "./pages/AuthSuccess";
import AuthFailure from "./pages/AuthFailure";
import useDeleteCard from "./hooks/useDeleteCard";
const SignUp = lazy(() => import("./pages/Signup"));
const Cards = lazy(() => import("./pages/Cards"));
import Loading from "./components/Loading";
import { UserContext } from "./context/UserContext";
import VerifyEmail from './pages/VerifyEmail';
import ShowAlert from './components/ShowAlert';

function App() {
  const { theme } = useContext(UserContext);
  const { mutate: deleteOneDeck } = useDeleteDeck();
  // const { mutate: pinDeck } = usePinDeck();
  const { mutate: deleteCardItem } = useDeleteCard();

  const handlePin = async (result: DropResult, provided: ResponderProvided) => {
    // if (result.destination?.droppableId === "pinnedArea") {
    //   pinDeck({ id: result.draggableId, pinned: true });
    // } else if (result.destination?.droppableId === "othersDeckArea") {
    //   pinDeck({ id: result.draggableId, pinned: false });
    // } else
    if (result.destination?.droppableId == "deleteArea") {
      deleteOneDeck(result.draggableId);
    } else if (result.destination?.droppableId == "cardDeleteArea") {
      const receivedData = result.draggableId.split("-");
      const data = {
        deck_id: receivedData[0],
        index: parseInt(receivedData[1]),
      };
      deleteCardItem(data);
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
          handlePin(result, provided);
        }}
      >
          
   <ShowAlert />
        <Layout>
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<Deck />} />
              <Route
                path="/cards/:deck_id"
                element={
                  <Suspense fallback={<Loading />}>
                    <Cards />
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
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/failure" element={<AuthFailure />} />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            {/* <Route path='*' element={<NotFound/>} /> */}
          </Routes>
        </Layout>
      </DragDropContext>
    </>
  );
}

export default App;
