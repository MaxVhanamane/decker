import "./App.css";
import Deck from "./pages/Deck";
import { Routes, Route } from "react-router-dom";
import Cards from "./pages/Cards";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import usePinDeck from "./hooks/usePinDeck";
import useDeleteDeck from "./hooks/useDeleteDeck";
import NotFound from "./componenets/NotFound";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import PrivateRoutes from "./componenets/PrivateRoutes";
import Layout from "./componenets/Layout";
import AuthSuccess from "./pages/AuthSuccess";
import AuthFailure from "./pages/AuthFailure";
import  useDeleteCard  from "./hooks/useDeleteCard";


function App() {

  const { mutate: deleteOneDeck } = useDeleteDeck();
  const { mutate: pinDeck } = usePinDeck();
  const {mutate:deleteCardItem}=useDeleteCard()

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
      const data = { deck_id: receivedData[0], index: parseInt(receivedData[1]) };
      deleteCardItem(data)

    }
  };
  return (
    <>
      <DragDropContext
        onDragEnd={(result: DropResult, provided: ResponderProvided) => {
          handlePin(result, provided);
        }}
      >
        <Layout>
          
          <Routes>
            <Route element={<PrivateRoutes />}>
              <Route path="/" element={<Deck />} />
              <Route path="/cards/:deck_id" element={<Cards />} />
            </Route>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/failed" element={<AuthFailure />} />
            {/* <Route path='*' element={<NotFound/>} /> */}
          </Routes>
        </Layout>
      </DragDropContext>
    </>
  );
}

export default App;
