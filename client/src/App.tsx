import "./App.css";
import Home from "./componenets/Deck";
import { Routes, Route } from "react-router-dom"
import Cards  from './componenets/Cards';
import { DragDropContext, DropResult, ResponderProvided } from "react-beautiful-dnd";
import usePinDeck from './hooks/usePinDeck';
import useDeleteDeck from './hooks/useDeleteDeck';


function App() {
const {mutate:deleteOneDeck}=useDeleteDeck()
  const {mutate:pinDeck}=usePinDeck()
  
      const handlePin = async (result: DropResult,provided: ResponderProvided) => {
        if(result.destination?.droppableId==="pinnedArea"){
          pinDeck({id:result.draggableId,pinned:true}) 
        }
        else if(result.destination?.droppableId==="deckArea"){
          pinDeck({id:result.draggableId,pinned:false}) 
        }
        else if(result.destination?.droppableId=="deleteArea"){
          deleteOneDeck(result.draggableId)
        }

      };
  return (<>
   <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided)=>{handlePin(result,provided)}}>
     <Routes>
        <Route path="/" element={ <Home /> } />
        <Route path="/cards/:deck_id" element={ <Cards/> } />
      </Routes>
      </DragDropContext>
    </>
  );
}

export default App;
