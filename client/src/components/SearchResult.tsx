import {
  FC,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
  memo,
  useTransition,
} from "react";

import EditModalForDeck from "./EditModalForDeck";
import { UserContext } from "../context/UserContext";
import useGetDecksAndCards from "../hooks/useGetDecksAndCards";
import { SearchResultCardsType, SearchResultDeckType } from "../types/types";
import { searchContext } from "../context/SearchContext";
import DeckAndCardResult from "./DeckAndCardResult";
import { useNavigate } from "react-router-dom";

let timer: NodeJS.Timeout;

// types
interface IProp {
  searchQuery: string;
  inputValue: string;
}

const SearchResult: FC<IProp> = ({ searchQuery, inputValue }) => {
  const [showResult, setShowResult] = useState(false);
  const [foundCards, setFoundCards] = useState<SearchResultCardsType[]>([]);
  const [foundDecks, setFoundDecks] = useState<SearchResultDeckType[]>([]);
  const { data, isError, error, isLoading } = useGetDecksAndCards();
  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const {
    animateCloseEditDeckModalInSearchResult,
    setAnimateCloseEditDeckModalInSearchResult,
    openEditDeckModalForSearchResult,
    setOpenEditDeckModalForSearchResult,
  } = useContext(searchContext);
  const [isPending, startTransition] = useTransition();
  const { theme, setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  // Here, we will add all the cards from all the decks in a single array by including some additional properties that we require later
  const allCards = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!Array.isArray(data)) {
      return [];
    }
    // The flat() method creates a new array with the elements of the subarrays concatenated into it.
    return data?.flatMap((deck) =>
      deck?.cards?.map((card, index) => ({
        ...card,
        deck_id: deck?._id,
        cardIndex: index,
        deckTitle: deck?.title,
      }))
    );
  }, [data]);
  // Here, we will take out all the decks names with some additional properties

  const allDecks = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!Array.isArray(data)) {
      return [];
    }
    return data?.map((data) => ({
      deck_id: data?._id,
      title: data?.title,
      pinned: data?.pinned,
      cards: data?.cards,
    }));
  }, [data]);

  //Cards code
  const filterDecksAndCards = useCallback(() => {
    if (isLoading) {
      return;
    }
    setShowResult(false);

    const filteredCards = allCards
      ? allCards?.filter(
          (card) =>
            card?.note?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
            card?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        )
      : [];
    // we will filter all the decks that matches the search query
    const filteredDecks = allDecks
      ? allDecks?.filter((deck) => {
          return deck?.title
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase());
        })
      : [];

    setFoundDecks(filteredDecks);
    setFoundCards(filteredCards);
    setShowResult(true);
  }, [searchQuery, data]);

  useEffect(() => {
    if (
      data?.message ===
      "Your session has expired. Please log in again to continue."
    ) {
      setUserInfo(null);
      navigate("/sessionexpired", { replace: true });
    }
  }, [data]);

  useEffect(() => {
    if (searchQuery !== inputValue) {
      setShowResult(false);
    }
    if (searchQuery.length > 0) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (searchQuery === inputValue) {
          filterDecksAndCards();
        }
      }, 500);
    } else {
      clearTimeout(timer);
      setFoundDecks([]);
      setFoundCards([]);
      setShowResult(false);
    }
  }, [searchQuery, filterDecksAndCards, data, inputValue]);

  if (isLoading && searchQuery?.length > 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent  text-gray-200   top-[3.45rem] bg-[#fcfefc]">
        <div className="-mt-[3.45rem]">
          <img
            src={
              localStorage.getItem("theme") === "dark" ||
              localStorage.getItem("theme") === null
                ? "/loading_dark.gif"
                : "/loading_light.gif"
            }
            alt="loading"
            width={200}
            height={200}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" dark:text-white text-gray-800 fixed top-[6.5rem] h-12 flex items-start justify-center w-full bg-[#fcfefc] dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent z-50 lg:hidden font-bold pt-2 ">
        {searchQuery.length > 0 &&
          (foundDecks.length > 0 || foundCards.length > 0) && (
            <div className="">
              {foundDecks.length + foundCards.length > 1 ? (
                <p>
                  Search Results
                  <span className="font-extralight text-xs ml-1">
                    (about {foundDecks.length + foundCards.length} results)
                  </span>
                </p>
              ) : (
                <p>Search Result</p>
              )}
            </div>
          )}
      </div>
      <div
        className={`fixed  top-[9rem] lg:top-[3.45rem] overflow-scroll h-screen bg-[#fcfefc]  dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent w-full  `}
      >
        <div className="hidden bg-[#fcfefc] fixed lg:top-[3.45rem] text-md dark:text-white text-gray-800 w-full lg:flex items-center justify-center dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent z-50 pb-4 pt-3">
          {searchQuery.length > 0 &&
            (foundDecks.length > 0 || foundCards.length > 0) &&
            showResult && (
              <div className="mt-2 font-bold">
                {foundDecks.length + foundCards.length > 1 ? (
                  <p>
                    Search Results
                    <span className="font-extralight text-xs  ml-1">
                      (about {foundDecks.length + foundCards.length} results)
                    </span>
                  </p>
                ) : (
                  <p>Search Result</p>
                )}
              </div>
            )}
        </div>

        {(searchQuery.length > 0 && foundDecks.length > 0) ||
        foundCards.length > 0 ||
        inputValue.length > 0 ? (
          searchQuery === inputValue && showResult && inputValue.length > 0 ? (
            <DeckAndCardResult
              foundDecks={foundDecks}
              foundCards={foundCards}
              setFoundDecks={setFoundDecks}
              setEditData={setEditData}
              editData={editData}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="flex items-center justify-center dark:text-gray-50  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
              <p>searching...</p>
            </div>
          )
        ) : (
          <div
            className={`flex items-center justify-center z-50 w-screen h-full text-md font-semibold animate-quickOpacity`}
          >
            {showResult &&
            searchQuery.length > 0 &&
            foundDecks.length === 0 &&
            foundCards.length === 0 ? (
              <div className="relative flex items-center justify-center flex-col lg:top-[-3.42rem] -top-[9rem]">
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
              <div className="relative flex items-center justify-center flex-col lg:top-[-3.42rem] -top-[9rem] gap-2">
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
                  Find relevant content across decks and cards. Start typing to
                  locate.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {openEditDeckModalForSearchResult ? (
        <EditModalForDeck
          openEditDeckModal={openEditDeckModalForSearchResult}
          setOpenEditDeckModal={setOpenEditDeckModalForSearchResult}
          editData={editData}
          setEditData={setEditData}
          setAnimateCloseEditDeckModal={
            setAnimateCloseEditDeckModalInSearchResult
          }
          animateCloseEditDeckModal={animateCloseEditDeckModalInSearchResult}
        />
      ) : null}
    </>
  );
};

export default memo(SearchResult);
