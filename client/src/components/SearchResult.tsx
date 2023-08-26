import {
  Dispatch,
  FC,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
  memo,
} from "react";
import { BiEdit } from "react-icons/bi";
import { BsFillPinFill, BsPin } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import usePinDeck from "../hooks/usePinDeck";
import EditModalForDeck from "./EditModalForDeck";
import { UserContext } from "../context/UserContext";
import useGetDecksAndCards from "../hooks/useGetDecksAndCards";
import { OfflineContext } from "../context/OfflineContext";
import { AlertContext } from "../context/AlertContext";
import { AlertData, DeckAndCardType } from "../types/types";
import Loading from "./Loading";

let timer: any;

// types
interface IProp {
  searchQuery: string;
  setShowSearchBar: Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery: Dispatch<React.SetStateAction<string>>;
}

type SearchResultCardsType = {
  deck_id: string;
  title: string;
  note: string;
  cardIndex: number;
  cardId: string;
  _id: string;
  deckTitle: string;
};

type SearchResultDeckType = {
  deck_id: string;
  title: string;
  pinned: boolean;
};

const SearchResult: FC<IProp> = ({
  searchQuery,
  setShowSearchBar,
  setSearchQuery,
}) => {
  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);

  const [showResult, setShowResult] = useState(false);
  const [foundCards, setFoundCards] = useState<SearchResultCardsType[]>([]);
  const [foundDecks, setFoundDecks] = useState<SearchResultDeckType[]>([]);
  const { data, isError, error, isLoading } = useGetDecksAndCards();

  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const {
    mutate: pinDeck,
    error: pinError,
    isError: isPinError,
    isLoading: isPinning,
  } = usePinDeck();
  const [deckInfo, setDeckInfo] = useState<DeckAndCardType | null>();
  const [openEditDeckModal, setOpenEditDeckModal] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const regex = /\/cards\/.*/;
    const deck_id_value = location.pathname.split("/")[2];
    if (regex.test(location.pathname)) {
      const filteredDeck = data?.filter((deck) => {
        if (deck._id === deck_id_value) {
          return deck;
        }
      });
      setDeckInfo(filteredDeck?.[0]);
    } else {
      setDeckInfo(null);
    }
  }, []);
  const { theme } = useContext(UserContext);
  // Here, we will add all the cards from all the decks in a single array by including some additional properties that we require later
  const allCards = useMemo(() => {
    if (!data) {
      return [];
    }
    // The flat() method creates a new array with the elements of the subarrays concatenated into it.
    return data.flatMap((deck) =>
      deck.cards.map((card, index) => ({
        ...card,
        deck_id: deck._id,
        cardIndex: index,
        deckTitle: deck.title,
      }))
    );
  }, [data]);
  // Here, we will take out all the decks names with some additional properties
  const allDecks = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map((data) => ({
      deck_id: data._id,
      title: data.title,
      pinned: data.pinned,
      cards: data.cards,
    }));
  }, [data]);

  //Cards code
  const filterCards = useCallback(() => {
    // const allCards =  data?.flatMap(deck => deck.cards.map((card,index) => ({ ...card, deck_id: deck._id,cardIndex:index})))
    // const allDecks =  data?.map((data)=>{return {deck_id:data._id,title:data.title,pinned:data.pinned}})
    // we will filter all the cards that matches the search query
    const filteredCards = allCards
      ? allCards.filter(
          (obj) =>
            obj.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
            obj.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
    // we will filter all the decks that matches the search query
    const filteredDecks = allDecks
      ? allDecks.filter((obj) => {
          return obj.title.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : [];
    setFoundDecks(filteredDecks);
    setFoundCards(filteredCards);
    setShowResult(true);
  }, [searchQuery, data]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        filterCards();
      }, 500);
    } else {
      clearTimeout(timer);
      setFoundDecks([]);
      setFoundCards([]);
      setShowResult(false);
    }
  }, [searchQuery, filterCards, data]);

  const handleEditDeck = (deck_id: string, title: string) => {
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
    setEditData({ ...editData, deck_id, title });
    setOpenEditDeckModal(true);
  };

  //   const regex = new RegExp((${searchQuery}), "gi");, "gi" are flags that modify the behavior of the regular expression.
  // The g flag stands for "global" and tells the regular expression to match all occurrences of the search query in the input text, not just the first one.
  // The i flag stands for "case-insensitive" and tells the regular expression to ignore the case of the search query when matching against the input text.
  function highlightText(text: string, searchQuery: string) {
    // here we will escape special characters because they have some meaning in regular expression.
    // for eg. if you put "/" in search string ("react/") this will throw an error so we will escape "/" and then search it.
    const escapedSearchQuery = searchQuery.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(`(${escapedSearchQuery})`, "gi");
    const foundString = text.split(regex);
    return (
      <>
        {foundString.map((part, index) =>
          // regex.test(part) checks if it matches the searchQuery if it does it returns true. if it is true then we will add background color to
          // that string. if it returns false then we will return the string as it is.
          regex.test(part) ? (
            <span
              key={index}
              className={`${theme == "dark" ? "bg-red-500" : "bg-yellow-300"}`}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  }

  const handlePin = async (id: string, pinned: boolean) => {
    // This code is for optimistic updates. as I am updating data in useEffect it takes a little time to show pinned or unpinned changes.
    // To see the changes instantly I am doing optimistic updates here.
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
    const pinnedDecks = foundDecks.filter((obj) => obj.pinned === true);
    const unpinnedDecks = foundDecks.filter((obj) => obj.pinned === false);
    const deckToBeChanged = foundDecks.find((obj) => obj.deck_id === id);
    deckToBeChanged!.pinned = !pinned;
    let finalData;
    if (pinned) {
      const newArr = pinnedDecks.filter((obj) => obj.deck_id !== id);
      unpinnedDecks.unshift(deckToBeChanged!);
      finalData = newArr.concat(unpinnedDecks);
    } else {
      const newUnpinnedArr = unpinnedDecks.filter((obj) => obj.deck_id !== id);
      pinnedDecks.unshift(deckToBeChanged!);
      finalData = newUnpinnedArr.concat(pinnedDecks);
    }

    setFoundDecks(finalData);
    // This is react query function to pin or unpin decks

    pinDeck({ id, pinned: !pinned });
  };

  if (isLoading) {
    <Loading />;
  }

  return (
    <>
      <div className="border-t dark:border-slate-300/10 dark:text-white text-gray-800 fixed top-0 mt-12 h-[6rem] flex items-end justify-center w-full bg-[#fcfefc] dark:bg-slate-950 z-50 lg:hidden font-bold ">
        {searchQuery.length > 0 &&
          (foundDecks.length > 0 || foundCards.length > 0) && (
            <div className="absolute bottom-4">{foundDecks.length+foundCards.length>1?<p>Search Results <span className="font-extralight text-xs">(about {foundDecks.length+foundCards.length} results)</span></p> :<p>Search Result</p>}</div>
          )}
      </div>
      <div className="fixed lg:top-[3.42rem] top-12 overflow-scroll h-screen bg-[#fcfefc]  dark:bg-slate-950 w-full    ">
        <div className="hidden bg-[#fcfefc] border-t border-slate-900/10 dark:border-slate-300/10 fixed lg:top-[3.35rem] text-md dark:text-white text-gray-800 w-full lg:flex items-center justify-center dark:bg-slate-950 z-50 pb-4 pt-3">
          {searchQuery.length > 0 &&
            (foundDecks.length > 0 || foundCards.length > 0) && (
              <div className="mt-2 font-bold">
                {foundDecks.length+foundCards.length>1?<p>Search Results <span className="font-extralight text-xs">(about {foundDecks.length+foundCards.length} results)</span></p> :<p>Search Result</p>}</div>
            )}
        </div>
        {(searchQuery.length > 0 && foundDecks.length > 0) ||
        foundCards.length > 0 ? (
          <div>
            {foundDecks?.filter((deck) => deck.pinned === true).length > 0 && (
              <div className="mt-24 lg:mt-16 lg:mb-10 mx-1">
                <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">
                  Pinned Decks
                </p>
                <div className="flex flex-row flex-wrap gap-2 justify-center items-center p-2 lg:mx-20">
                  {foundDecks
                    ?.filter((deck) => deck.pinned === true)
                    .map((deck) => {
                      return (
                        <div
                          key={deck.deck_id}
                          className="relative border border-gray-400 text-gray-800 dark:text-gray-50 rounded-md w-[10.5rem] px-2  min-h-[5.5rem] flex justify-center items-center text-justify transition-[background-color,border-color] duration-100  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] before:absolute hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]  hover:after:bg-gray-100 dark:hover:after:bg-slate-900 overflow-hidden before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 after:rounded-sm z-30"
                        >
                          <div className="z-40">
                            <div className="absolute bottom-0 right-0">
                              <button
                                onClick={() => {
                                  handleEditDeck(deck.deck_id, deck.title);
                                }}
                                type="button"
                                className="text-lg outline-none rounded-tr px-1 text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                aria-label="Edit Deck"
                              >
                                <BiEdit />
                              </button>
                              <button
                                onClick={() => {
                                  handlePin(deck.deck_id, deck.pinned);
                                }}
                                type="button"
                                className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95"
                                aria-label="Pin Deck"
                              >
                                <BsFillPinFill />
                              </button>
                            </div>
                            <Link
                              onClick={() => setShowSearchBar(false)}
                              to={`cards/${deck.deck_id}`}
                              state={{ deck }}
                            >
                              <p
                                className=" break-all font-semibold  line-clamp-1 h-7 text-center  "
                                onClick={() => setSearchQuery("")}
                              >
                                {searchQuery.length > 0 &&
                                  highlightText(deck.title, searchQuery)}
                              </p>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {foundDecks?.filter((deck) => deck.pinned === false).length > 0 && (
              <div
                className={`${
                  foundDecks?.filter((deck) => deck.pinned === true).length > 0
                    ? "mt-12"
                    : "mt-24 "
                } mx-1 lg:mb-10`}
              >
                <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">
                  Other Decks
                </p>
                <div className="flex flex-row flex-wrap gap-2 justify-center items-center p-2 lg:mx-20">
                  {foundDecks
                    ?.filter((deck) => deck.pinned === false)
                    .map((deck) => {
                      return (
                        <div
                          key={deck.deck_id}
                          className="relative border border-gray-400 text-gray-800 dark:text-gray-50 rounded-md w-[10.5rem] px-2  min-h-[5.5rem] flex justify-center items-center text-justify transition-[background-color,border-color] duration-100  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 hover:before:content-[''] before:absolute hover:before:w-[3rem] hover:before:py-[60%] hover:before:bg-gradient-to-r hover:before:from-sky-500 hover:before:to-green-400 hover:before:animate-rotate hover:after:content-[''] hover:after:absolute hover:after:inset-[0.15rem]  hover:after:bg-gray-100 dark:hover:after:bg-slate-900 overflow-hidden before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-300 after:rounded-sm z-30"
                        >
                          <div className="z-40">
                            <div className="absolute bottom-0 right-0">
                              <button
                                onClick={() => {
                                  handleEditDeck(deck.deck_id, deck.title);
                                }}
                                type="button"
                                className="text-lg outline-none rounded-tr px-1 text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                aria-label="Edit Deck"
                              >
                                <BiEdit />
                              </button>
                              <button
                                onClick={() => {
                                  handlePin(deck.deck_id, deck.pinned);
                                }}
                                type="button"
                                className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95"
                                aria-label="Pin Deck"
                              >
                                <BsPin />
                              </button>
                            </div>
                            <Link
                              onClick={() => setShowSearchBar(false)}
                              to={`cards/${deck.deck_id}`}
                              state={{ deck }}
                            >
                              <p
                                className=" break-all font-semibold  line-clamp-1 h-7 text-center  "
                                onClick={() => setSearchQuery("")}
                              >
                                {searchQuery.length > 0 &&
                                  highlightText(deck.title, searchQuery)}
                              </p>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {openEditDeckModal ? (
              <EditModalForDeck
                openEditDeckModal={openEditDeckModal}
                setOpenEditDeckModal={setOpenEditDeckModal}
                editData={editData}
                setEditData={setEditData}
              />
            ) : null}

            {/* CARD  */}

            {foundCards.length > 0 && (
              <p
                className={`text-left text-md font-semibold text-gray-800 dark:text-gray-50 mx-5 mb-4 ${
                  foundDecks.length > 0 ? "mt-12" : "mt-[5.5rem]"
                }`}
              >
                Cards
              </p>
            )}

            <div className="flex flex-row flex-wrap justify-center items-center  mx-2 lg:mx-52 mb-48 gap-4">
              {foundCards?.map((card, index) => (
                <Link
                  key={index}
                  to={`cards/${card.deck_id}/${card.cardIndex}`}
                  state={{ from: location.pathname, card, deckInfo }}
                >
                  <div className="border relative border-gray-400 flex flex-col text-gray-800 rounded-md px-2 py-2 h-[8.8rem] lg:h-40 text-justify lg:w-[50vw] w-[95vw] transition-[background-color,border-color] duration-300  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 group">
                    <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1 ">
                      {searchQuery.length > 0 &&
                        highlightText(card.title, searchQuery)}
                    </p>
                    <p className="text-sm lg:text-base  text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1">
                      {searchQuery.length > 0 &&
                        highlightText(card.note, searchQuery)}
                    </p>
                    <p className="absolute text-gray-50 bg-teal-800 group-hover:bg-teal-700   dark:bg-sky-800  dark:group-hover:bg-sky-700 transition duration-300 right-0 bottom-0 px-2 rounded-br-[0.340rem] rounded-tl-md line-clamp-1 break-all text-center  max-w-[10rem]">
                      {card.deckTitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center z-50 w-screen h-full text-md font-semibold`}
          >
            {" "}
            {showResult &&
            searchQuery.length > 0 &&
            foundDecks.length <= 0 &&
            foundCards.length <= 0 ? (
              <div className="relative flex items-center justify-center flex-col lg:top-[-3.42rem] -top-12">
                <img
                  src={`${
                    theme === "dark"
                      ? "/illustrations/no_result_found_dark.svg"
                      : "/illustrations/no_result_found_light.svg"
                  }`}
                  alt="No result found image"
                  className="w-52 h-44 "
                />
                <p className="text-gray-800 dark:text-gray-50">
                  No result found!
                </p>
              </div>
            ) : (
              <div className="relative flex items-center justify-center flex-col lg:top-[-3.42rem] -top-12 gap-2">
                <img
                  src={`${
                    theme === "dark"
                      ? "/illustrations/search_dark.svg"
                      : "/illustrations/search_light.svg"
                  }`}
                  alt="Image depicting a person searching through a library of card"
                  className="lg:w-44 lg:h-44 w-40 h-40  "
                />
                <p className=" text-gray-700 dark:text-gray-200 px-2">
                  Find relevant content from all decks and cards with keyword
                  search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(SearchResult);
