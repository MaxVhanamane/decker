import { FormEvent, useState, useEffect } from "react";
import "./App.css";

type DeckTypes = {
  _id: string;
  title: string;
};
function App() {
  const [title, setTitle] = useState<string>("");
  const [decks, setDecks] = useState<DeckTypes[]>([]);


 


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/deck", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const newDeck= await response.json()
    setTitle("")
    setDecks([...decks,newDeck])
  };

  
  const handleDelete = async (id:string) => {
    const response = await fetch(`http://localhost:5000/deck/${id}`, {
      method: "DELETE",
    
    });
   let afterDelete= decks.filter((d)=>{return d._id !=id})
   setDecks(afterDelete)
  };


  useEffect(() => {
    // self executing anonymous function
    (async () => {
      const decks = await fetch("http://localhost:5000/deck");
      const receivedDecks = await decks.json();
      setDecks(receivedDecks);
    })(); 
  }, []);

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-screen h-screen ">
      <div className="w-full px-4 mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-4 justify-center items-center">
          <label htmlFor="title" className=" flex justify-center items-center">
            Deck title
          </label>
          <input
            className=" w-96 border-2 border-gray-800 text-gray-900 px-2 rounded-md"
            type="text"
            id="title"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
            }}
            value={title}
          />
          <button className="bg-blue-500 px-2 rounded-md ">Add Deck</button>
        </form>
      </div>
      <div className="mt-6 w-full mx-auto">
        <ul className="flex flex-row flex-wrap gap-4 justify-center items-center">
          {decks.map((deck) => {
            return (
              <li
                className="relative bg-gray-600  flex text-gray-50 
                             rounded-md w-28 h-28 text-center my-auto justify-center items-center"
                           key={deck._id}
              >
               <button onClick={()=>{handleDelete(deck._id)}} className="absolute rounded top-1 right-1 bg-gray-50 text-red-500 font-bold cursor-pointer text-sm px-1 hover:bg-gray-200">X</button> {deck.title}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
