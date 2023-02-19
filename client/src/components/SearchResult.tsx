import {Dispatch, FC,useEffect,useMemo,useState, useCallback,useContext} from 'react'
import { BiEdit } from 'react-icons/bi';
import useGetDecks from '../hooks/useGetDecks';
import { BsFillPinFill, BsPin } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import usePinDeck from '../hooks/usePinDeck';
import EditModalForDeck from './EditModalForDeck';
import { UserContext } from '../context/UserContext';
interface IProp{
    searchQuery:string;
    setShowSearchBar:Dispatch<React.SetStateAction<boolean>>;
}
// types

  type SearchResultCardsType={
    deck_id: string;
    title: string;
    note: string;
    cardIndex:number
}

  type SearchResultDeckType={
    deck_id: string;
    title: string;
    pinned: boolean;
}


const SearchResult:FC<IProp> = ({searchQuery,setShowSearchBar}) => {
const [foundCards,setFoundCards]=useState<SearchResultCardsType[]>([])
const [foundDecks,setFoundDecks]=useState<SearchResultDeckType[]>([])
const { data, isError, error, isLoading } = useGetDecks()
const [editData,setEditData]=useState({deck_id:"",title:""})
const {mutate:pinDeck,error:pinError,isError:isPinError,isLoading:isPinning}=usePinDeck()
const [openEditDeckModal,setOpenEditDeckModal]=useState(false)
const location = useLocation();
const {theme}=useContext(UserContext)

// Here, we will add all the cards from all the decks in a single array by including some additional properties that we require later
const allCards = useMemo(() => {
    if (!data) {
      return [];
    }
    // The flat() method creates a new array with the elements of the subarrays concatenated into it.
    return data.flatMap((deck) =>
      deck.cards.map((card, index) => ({ ...card, deck_id: deck._id, cardIndex: index }))
    );
  }, [data]);
// Here, we will take out all the decks names with some additional properties
  const allDecks = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map((data) => ({ deck_id: data._id, title: data.title, pinned: data.pinned }));
  }, [data]);
  
let pinnedDeckCount
let unPinnedDeckCount
//Cards code
const filterCards = useCallback(() => {
  // const allCards =  data?.flatMap(deck => deck.cards.map((card,index) => ({ ...card, deck_id: deck._id,cardIndex:index})))
  // const allDecks =  data?.map((data)=>{return {deck_id:data._id,title:data.title,pinned:data.pinned}})
  // we will filter all the cards that matches the search query
    const filteredCards = allCards
      ? allCards.filter(
          obj =>
            obj.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
      // we will filter all the decks that matches the search query
    const filteredDecks = allDecks
      ? allDecks.filter(
          obj => {
            return obj.title.toLowerCase().includes(searchQuery.toLowerCase())
          }
        )
      : [];
    setFoundDecks(filteredDecks);
    setFoundCards(filteredCards);
  }, [searchQuery,data]);
  
  useEffect(() => {
    if (searchQuery.length > 0) {
      filterCards();
    } else {
      setFoundDecks([]);
      setFoundCards([]);
    }
  }, [searchQuery, filterCards,data]);
  
  const handleEditDeck=(deck_id:string,title:string)=>{
    setEditData({...editData,deck_id,title})
    setOpenEditDeckModal(true)
  }

//   const regex = new RegExp((${searchQuery}), "gi");, "gi" are flags that modify the behavior of the regular expression.
// The g flag stands for "global" and tells the regular expression to match all occurrences of the search query in the input text, not just the first one.
// The i flag stands for "case-insensitive" and tells the regular expression to ignore the case of the search query when matching against the input text.
  function highlightText(text:string, searchQuery:string) {
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const foundString = text.split(regex);
    return (
      <>
        {foundString.map((part, index) =>
        // regex.test(part) checks if it matches the searchQuery if it does it returns true. if it is true then we will add background color to 
        // that string. if it returns false then we will return the string as it is.
          regex.test(part) ? (
            <span key={index} className={`${theme=="dark"?"bg-red-500":"bg-yellow-300"}`}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  }
  
  
const handlePin = async (id:string,pinned:boolean) => {
    // This code is for optimistic updates. as I am updating data in useEffect it takes a little time to show pinned or unpinned changes.
    // To see the changes instantly I am doing optimistic updates here.

    const pinnedDecks= foundDecks.filter((obj)=>obj.pinned===true)
    const unpinnedDecks= foundDecks.filter((obj)=>obj.pinned===false)
    const deckToBeChanged=foundDecks.find(obj=>obj.deck_id===id)
    deckToBeChanged!.pinned=!pinned
    let finalData
    if(pinned){
     const newArr= pinnedDecks.filter(obj=>obj.deck_id!==id)
      unpinnedDecks.unshift(deckToBeChanged!)
      finalData=newArr.concat(unpinnedDecks)
    }
    else{
      const newUnpinnedArr=unpinnedDecks.filter(obj=>obj.deck_id!==id)
      pinnedDecks.unshift(deckToBeChanged!)
      finalData=newUnpinnedArr.concat(pinnedDecks)
    }

setFoundDecks(finalData)
    // This is react query function to pin or unpin decks

    pinDeck({id,pinned:!pinned})
  };




return <>
 <div className="border-t dark:border-slate-300/10 dark:text-white text-gray-800 fixed top-0 mt-12 h-20 flex items-end justify-center w-full bg-white dark:bg-[#0c1221] z-50 lg:hidden font-bold " >
    {(searchQuery.length>0 && (foundDecks.length>0 && foundCards.length>0)) && <p>Search Result</p>}
  </div>
<div className='fixed lg:top-[3.42rem] top-12 overflow-scroll h-screen bg-white  dark:bg-[#0c1221] w-full   '>
 <div className='hidden bg-white border-t border-slate-900/10 dark:border-slate-300/10 fixed lg:top-[3.35rem] text-md dark:text-white text-gray-800 w-full lg:flex items-center justify-center dark:bg-[#0c1221] z-50'>
  {searchQuery.length>0 && (foundDecks.length>0 && foundCards.length>0) && <p className='mt-2 font-bold'>Search Result</p>}
 </div>
 {searchQuery.length>0 && foundDecks.length>0 || foundCards.length>0 ?<div>
{foundDecks.length>0 && <div className="mt-24 lg:mt-12 lg:mb-10 mx-1">
  {foundDecks.length>0 && <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">Pinned Decks</p>}
  <div className="flex flex-row flex-wrap gap-2 justify-center items-center p-2 lg:mx-20">
    {foundDecks?.filter((deck) => deck.pinned === true).map((deck, index) => {
      return (
        <div key={deck.deck_id} className="relative border border-gray-400 text-gray-800 dark:text-gray-50 rounded-md min-w-[10.5rem] px-2 min-h-[5.5rem] flex justify-center items-center text-justify">
          <div className="absolute bottom-0 right-0">
            <button onClick={() => { handleEditDeck(deck.deck_id, deck.title) }} type="button" className="text-lg outline-none rounded-tr px-1 text-center hover:scale-95 text-sky-600 dark:text-sky-400" aria-label="Edit Deck">
              <BiEdit />
            </button>
            <button onClick={() => { handlePin(deck.deck_id, deck.pinned) }} type="button" className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95" aria-label="Pin Deck">
              <BsFillPinFill />
            </button>
          </div>
          <Link onClick={()=>setShowSearchBar(false)} to={`cards/${deck.deck_id}`}>
            <p className="break-all font-semibold py-6">{searchQuery.length>0 &&  highlightText(deck.title, searchQuery)}</p>
          </Link>
        </div>
      );
    })}
  </div>
</div>}

{foundDecks.length>0 &&<div className="mt-4 lg:mb-10 mx-1">
  {foundDecks?.length>0 &&  <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">Other Decks</p>}
  <div className="flex flex-row flex-wrap gap-2 justify-center items-center p-2 lg:mx-20">
    {foundDecks?.filter((deck) => deck.pinned === false).map((deck, index) => {
      return (
        <div key={deck.deck_id} className="relative border border-gray-400 text-gray-800 dark:text-gray-50 rounded-md min-w-[10.5rem] px-2 min-h-[5.5rem] flex justify-center items-center text-justify">
          <div className="absolute bottom-0 right-0">
            <button onClick={() => { handleEditDeck(deck.deck_id, deck.title) }} type="button" className="text-lg outline-none rounded-tr px-1 text-center hover:scale-95 text-sky-600 dark:text-sky-400" aria-label="Edit Deck">
              <BiEdit />
            </button>
            <button onClick={() => { handlePin(deck.deck_id, deck.pinned) }} type="button" className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95" aria-label="Pin Deck">
              <BsPin />
            </button>
          </div>
          <Link onClick={()=>setShowSearchBar(false)} to={`cards/${deck.deck_id}`}>
            <p className="break-all font-semibold py-6">{searchQuery.length>0 &&  highlightText(deck.title, searchQuery)}</p>
          </Link>
        </div>
      );
    })}
  </div>
</div>}

{openEditDeckModal?<EditModalForDeck openEditDeckModal={openEditDeckModal} setOpenEditDeckModal={setOpenEditDeckModal} editData={editData} setEditData={setEditData} />:null}

{/* CARD  */}

{foundCards.length>0 && <p className={`text-left text-md font-semibold text-gray-800 dark:text-gray-50 mx-5 mb-4 ${foundDecks.length>0?"mt-6":"mt-20"}`}>Cards</p>}

<div className="flex flex-row flex-wrap justify-center items-center  mx-2 lg:mx-52 mb-48 gap-4">
  {foundCards?.map((card, index) => (
    <Link key={index} to={`cards/${card.deck_id}/${card.cardIndex}`}  state={{from:location.pathname}}     >
    <div  className="flex flex-col text-gray-800
    rounded-md px-2  h-[8rem] lg:h-36  text-justify lg:w-[50vw] w-[95vw]  items-center justify-center">
      <div
        
        className="border bg-red-5000 relative border-gray-400 flex flex-col text-gray-800 rounded-md px-2 py-2 h-[8rem] lg:h-36 text-justify lg:w-[50vw] w-[95vw]"
      >
        
        <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1">
  {searchQuery.length>0 && highlightText(card.title, searchQuery)}
</p>
<p className="text-sm lg:text-base  text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1">
  {searchQuery.length>0 &&  highlightText(card.note, searchQuery)}
</p>

      </div>
    </div>
    </Link>
  ))}
</div>
</div> : <div className={`flex ${searchQuery.length>0 && (foundDecks.length<=0 && foundCards.length<=0) ? "items-center": "items-start"} justify-center z-50 w-screen h-full font-semibold`}> {searchQuery.length>0 && (foundDecks.length<=0 && foundCards.length<=0)?<p className='text-red-500'>No result found</p>:<p className='hidden lg:block mt-8 text-gray-700 dark:text-gray-200'>Discover relevant content from all decks and cards with keyword search</p>}</div>}
</div>
</>
}

export default SearchResult
