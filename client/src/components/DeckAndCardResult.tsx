import React, { Dispatch, FC, memo, useCallback, useContext } from "react";
import {
  AlertData,
  SearchResultCardsType,
  SearchResultDeckType,
} from "../types/types";
import { OfflineContext } from "../context/OfflineContext";
import { AlertContext } from "../context/AlertContext";
import { searchContext } from "../context/SearchContext";
import { UserContext } from "../context/UserContext";
import usePinDeck from "../hooks/usePinDeck";
import { BsFillPinFill, BsPin } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { Link, useLocation } from "react-router-dom";

type editDataType = {
  deck_id: string;
  title: string;
};

type PropType = {
  foundDecks: SearchResultDeckType[];
  foundCards: SearchResultCardsType[];
  setFoundDecks: Dispatch<React.SetStateAction<SearchResultDeckType[]>>;
  setEditData: Dispatch<
    React.SetStateAction<{
      deck_id: string;
      title: string;
    }>
  >;

  editData: editDataType;
  searchQuery: string;
};

const DeckAndCardResult: FC<PropType> = ({
  foundDecks,
  foundCards,
  setFoundDecks,
  setEditData,
  editData,
  searchQuery,
}) => {
  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);
  const { setOpenSearchBar } = useContext(searchContext);
  const { theme, divRefForUserSettings, handleShowUserInfomation } =
    useContext(UserContext);
  const {
    mutate: pinDeck,
    error: pinError,
    isError: isPinError,
    isPending: isPinning,
  } = usePinDeck();
  const location = useLocation();

  const { setOpenEditDeckModalForSearchResult } = useContext(searchContext);
  //   const regex = new RegExp((${searchQuery}), "gi");, "gi" are flags that modify the behavior of the regular expression.
  // The g flag stands for "global" and tells the regular expression to match all occurrences of the search query in the input text, not just the first one.
  // The i flag stands for "case-insensitive" and tells the regular expression to ignore the case of the search query when matching against the input text.

  const highlightText = useCallback(
    (text: string, searchQuery: string) => {
      // here we will escape special characters because they have some meaning in regular expression.
      // for eg. if you put "/" in search string ("react/") this will throw an error so we will escape "/" and then search it.
      const escapedSearchQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      // Create a regular expression to match the search query.
      const regex = new RegExp(`(${escapedSearchQuery})`, "gi");

      // Split the text using the regular expression and keep track of the first match.
      let isFirstMatch = false;
      const foundString = text
        .slice(0, 300)
        .split(regex)
        .map((part, index) => {
          // Check if the current part matches the search query.
          if (regex.test(part) && !isFirstMatch) {
            isFirstMatch = true;
            // Highlight the first occurrence.
            return (
              <span
                key={index}
                className={`${
                  theme === "dark" ? "bg-red-500" : "bg-yellow-300"
                }`}
              >
                {part}
              </span>
            );
          } else {
            return part;
          }
        });

      return <>{foundString}</>;
    },
    [theme]
  );

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

    pinDeck({ id, pinned: !pinned });
  };

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
    setOpenEditDeckModalForSearchResult(true);
  };
  return (
    <div>
      {foundDecks?.filter((deck) => deck.pinned === true).length > 0 && (
        <div className="lg:mt-16 lg:mb-10 mx-1 animate-quickOpacity">
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
                            if (
                              divRefForUserSettings.current?.classList.contains(
                                "scale-100"
                              )
                            ) {
                              handleShowUserInfomation();
                            }
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
                            if (
                              divRefForUserSettings.current?.classList.contains(
                                "scale-100"
                              )
                            ) {
                              handleShowUserInfomation();
                            }
                          }}
                          type="button"
                          className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95"
                          aria-label="Pin Deck"
                        >
                          <BsFillPinFill />
                        </button>
                      </div>
                      <Link
                        onClick={() => {
                          setOpenSearchBar(false);
                          handleShowUserInfomation();
                        }}
                        to={`cards/${deck.deck_id}`}
                        state={{
                          deck: {
                            title: deck?.title,
                            deck_id: deck?.deck_id,
                            cards: deck?.cards,
                          },
                        }}
                        replace={true}
                      >
                        <p className=" break-all font-semibold  line-clamp-1 h-7 text-center  ">
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
              : "lg:mt-16 "
          } mx-1 lg:mb-10 animate-quickOpacity`}
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
                            if (
                              divRefForUserSettings.current?.classList.contains(
                                "scale-100"
                              )
                            ) {
                              handleShowUserInfomation();
                            }
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
                            if (
                              divRefForUserSettings.current?.classList.contains(
                                "scale-100"
                              )
                            ) {
                              handleShowUserInfomation();
                            }
                          }}
                          type="button"
                          className="outline-none rounded-tr text-sm px-1 text-center text-red-500 hover:scale-95"
                          aria-label="Pin Deck"
                        >
                          <BsPin />
                        </button>
                      </div>
                      <Link
                        onClick={() => {
                          setOpenSearchBar(false), handleShowUserInfomation();
                        }}
                        to={`cards/${deck.deck_id}`}
                        state={{
                          deck: {
                            title: deck?.title,
                            deck_id: deck?.deck_id,
                            cards: deck?.cards,
                          },
                        }}
                        replace={true}
                      >
                        <p className=" break-all font-semibold  line-clamp-1 h-7 text-center  ">
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

      {/* CARD  */}

      {foundCards.length > 0 && (
        <p
          className={`text-left text-md font-semibold text-gray-800 dark:text-gray-50 mx-5 mb-4 ${
            foundDecks.length > 0 ? "mt-14" : "mt-[1.3rem] lg:mt-[5.5rem] "
          }`}
        >
          Cards
        </p>
      )}

      <div className="flex flex-row flex-wrap justify-center items-center  mx-2 lg:mx-52 mb-48 gap-4 animate-quickOpacity">
        {foundCards?.map((card, index) => (
          <Link
            onClick={handleShowUserInfomation}
            key={card.cardId}
            to={`/search/result/${card.deck_id}/${card.cardIndex}`}
            state={{ from: location.pathname, card }}
            replace={true}
          >
            <div className="border relative border-gray-400 flex flex-col text-gray-800 rounded-md px-2 py-2 h-[8.8rem] lg:h-40 text-justify lg:w-[50vw] w-[95vw] transition-[background-color,border-color] duration-300  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 group">
              <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1 ">
                {card.title ? (
                  highlightText(card.title, searchQuery)
                ) : (
                  <span className="lg:text-base dark:text-gray-500 text-gray-400">
                    You have not added title to this card.
                  </span>
                )}
              </p>
              <p className="text-sm lg:text-base  text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1">
                {card.note ? (
                  highlightText(card.note, searchQuery)
                ) : (
                  <span className=" dark:text-gray-500 text-gray-400">
                    You have not added a note to this card.
                  </span>
                )}
              </p>
              <p className="absolute text-gray-50 bg-teal-800 group-hover:bg-teal-700   dark:bg-sky-800  dark:group-hover:bg-sky-700 transition duration-300 right-0 bottom-0 px-2 rounded-br-[0.340rem] rounded-tl-md line-clamp-1 break-all text-center  max-w-[10rem]">
                {card.deckTitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default memo(DeckAndCardResult);
