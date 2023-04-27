import { useContext,useRef} from "react";
import Deck from "./pages/Deck";
import { Routes, Route } from "react-router-dom";
// import Cards from "./pages/Cards";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import useDeleteDeck from "./hooks/useDeleteDeck";
// import NotFound from "./componenets/NotFound";
// import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import PrivateRoutes from "./components/PrivateRoutes";
import AuthSuccess from "./pages/AuthSuccess";
import AuthFailure from "./pages/AuthFailure";
import SignUp from "./pages/Signup";
import Cards from "./pages/Cards";
import Loading from "./components/Loading";
import { UserContext } from "./context/UserContext";
import VerifyEmail from './pages/VerifyEmail';
import ShowAlert from './components/ShowAlert';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import useMoveCard from './hooks/useMoveCard';
import {useState} from "react"
import { DeckTypeWithIndex } from "./types/types";
import SessionExpiredPage from "./pages/SessionExpiredPage";
import DeleteMyAccount from "./pages/DeleteMyAccount";
import AccountDeletionSuccess from "./pages/AccountDeletionSuccess";
// putting timout variable outside of the function so that It will be created only once not on each render
// So that when I use clearTimeout(timeout) It will clear the right timeout variable(instance).
let timeout: NodeJS.Timeout

function App() {
  const [undoDeck,setUndoDeck]=useState<DeckTypeWithIndex | null>(null)
  const { theme } = useContext(UserContext);
  const { mutate: deleteOneDeck } = useDeleteDeck();
  const {deleteConfirmationModalForCard}=useContext(UserContext)
  const {mutate:moveCard,error:editMutationError,isError:isEditMutationError}=useMoveCard()
  const undoButtonRef=useRef<HTMLDivElement | null >(null)
  const [indexOfCardForDeletion,setIndexOfCardForDeletion]=useState<number | null>(null)
  const handlePopupForUndoButton=()=>{
    if(undoButtonRef.current?.classList.contains("scale-0")){
      undoButtonRef.current.classList.remove("scale-0")
      undoButtonRef?.current?.classList.add("!block")
      undoButtonRef.current.classList.add("!w-[19rem]")
      undoButtonRef.current.classList.add("!h-fit")
      undoButtonRef.current.classList.add("scale-100")
  
      timeout= setTimeout(()=>{
        undoButtonRef?.current?.classList.remove("scale-100")
      undoButtonRef?.current?.classList.add("scale-0")
      undoButtonRef?.current?.classList.add("hidden")
      },7000)
     
    }
    else if ( undoButtonRef?.current?.classList.contains("scale-100")){
      clearTimeout(timeout)
      undoButtonRef.current.classList.add("scale-0")
      undoButtonRef?.current?.classList.add("hidden")
      undoButtonRef.current.classList.remove("scale-100")
    }
   }


  const handleUndoDeck=(deck:DeckTypeWithIndex | null):void=>{
    if(deck===null){
      setUndoDeck(null)
    }
    else{
      setUndoDeck({...deck})
    }
  }

  const handleChange = async (result: DropResult, provided: ResponderProvided) => {
    // if (result.destination?.droppableId === "pinnedArea") {
    //   pinDeck({ id: result.draggableId, pinned: true });
    // } else if (result.destination?.droppableId === "othersDeckArea") {
    //   pinDeck({ id: result.draggableId, pinned: false });
    // } else
    if (result.destination?.droppableId == "DeckDeleteArea") {
      let data={
        _id:result.draggableId,
        handleUndoDeck
      }
      deleteOneDeck(data);
      // If user deletes decks one after the another that creates problem because when user deletes second deck 
      // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.
      if(undoButtonRef.current?.classList.contains("scale-0")){
        // undoButtonRef?.current?.classList.remove("scale-100")
        // undoButtonRef?.current?.classList.add("scale-0")
        // undoButtonRef?.current?.classList.add("hidden")
        handlePopupForUndoButton()
      }
      else{
        clearTimeout(timeout)
      undoButtonRef?.current?.classList.remove("scale-100")

        undoButtonRef?.current?.classList.add("scale-0")
        undoButtonRef?.current?.classList.add("hidden")
        handlePopupForUndoButton()
      }
    } else if (result.destination?.droppableId == "cardDeleteArea") {
      const receivedData = result.draggableId.split("-"); 
      const index=parseInt(receivedData[1])
      setIndexOfCardForDeletion(index)
      if(deleteConfirmationModalForCard?.current?.classList.contains("hidden")){
        deleteConfirmationModalForCard?.current?.classList.remove("hidden")
   }  
      // const receivedData = result.draggableId.split("-");
      // const data = {
      //   deck_id: receivedData[0],
      //   index: parseInt(receivedData[1]),
      // };
      // deleteCardItem(data);
    }
    else if(result.destination?.droppableId == "cardDropableArea"){
      let deleteIndex=result.source.index
      let moveIndex=result.destination.index
      const receivedData = result.draggableId.split("-");
      const id= receivedData[0]
      let data={
        deleteIndex,moveIndex,
        deck_id:id
      }
      moveCard(data)

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
              <Route path="/" element={<Deck undoDeck={undoDeck} handleUndoDeck={handleUndoDeck} undoButtonRef={undoButtonRef} handlePopupForUndoButton={handlePopupForUndoButton}/>} />
              <Route
                path="/cards/:deck_id"
                element={
                    <Cards />
                }
              />
              <Route
                path="/cards/:deck_id/:search_index"
                element={
                    <Cards />
                }
              />
              <Route
                path="/account/deletemyaccount"
                element={
                    <DeleteMyAccount />
                }
              />
            </Route>

            <Route
              path="/signup"
              element={
                  <SignUp />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/sessionexpired" element={<SessionExpiredPage />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/failure" element={<AuthFailure />} />
            <Route path="/accountdeletionsuccess" element={<AccountDeletionSuccess />} />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            {/* <Route path='*' element={<NotFound/>} /> */}
          </Routes>
        
      </DragDropContext>
    </>
  );
}

export default App;
