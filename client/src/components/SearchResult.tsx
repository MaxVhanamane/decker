import {
  FC,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useContext,
  memo,
} from "react";

import EditModalForDeck from "./EditModalForDeck";
import { UserContext } from "../context/UserContext";
import useGetDecksAndCards from "../hooks/useGetDecksAndCards";
import {
  AlertData,
  SearchResultCardsType,
  SearchResultDeckType,
} from "../types/types";
import { searchContext } from "../context/SearchContext";
import DeckAndCardResult from "./DeckAndCardResult";
import { useNavigate } from "react-router-dom";
import useEditDeck from "../hooks/useEditDeck";
import { AlertContext } from "../context/AlertContext";
import { debounce } from "lodash";

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
  const [foundResults, setFoundResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const { data, isError, error, isLoading, isPaused } = useGetDecksAndCards();
  const { setAlert } = useContext(AlertContext);
  const [editData, setEditData] = useState({ deck_id: "", title: "" });
  const {
    mutate: editDeck,
    isError: isEditDeckError,
    error: editDeckError,
    data: editDeckResponse,
    reset: resetEditDeckResponse,
  } = useEditDeck();
  const {
    animateCloseEditDeckModalInSearchResult,
    setAnimateCloseEditDeckModalInSearchResult,
    openEditDeckModalForSearchResult,
    setOpenEditDeckModalForSearchResult,
    setOpenSearchBar,
    openSearchBar,
  } = useContext(searchContext);
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
    setFoundResults(false);
    setSearching(true);
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
    setSearching(false);

    if (filteredDecks.length > 0 || filteredCards.length > 0) {
      setFoundResults(true);
    }
  }, [searchQuery, data]);

  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty(
        "--window-height",
        `${window.innerHeight}px`
      );
    };

    // Initial setup
    handleResize();

    // Add event listener
    window.addEventListener("resize", debounce(handleResize, 500));

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (error) {
      if (
        error?.message ===
        "Your session has expired. Please log in again to continue."
      ) {
        setUserInfo(null);
        navigate("/sessionexpired", { replace: true });
      }
    }
  }, [error]);

  // useEffect(() => {
  //   if (isError) {
  //     setAlert((preval: AlertData) => ({
  //       ...preval,
  //       severity: "error",
  //       show: true,
  //       message:
  //         "Oops! Something went wrong while searching for decks and cards. Please try again later.",
  //       autoHideDuration: 5000,
  //     }));
  //   }
  // }, [isError]);

  useEffect(() => {
    if (isEditDeckError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: editDeckError?.message,
        autoHideDuration: 5000,
      }));
      resetEditDeckResponse();
    }
  }, [isEditDeckError]);

  useEffect(() => {
    if (openEditDeckModalForSearchResult) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openEditDeckModalForSearchResult]);

  useEffect(() => {
    if (searchQuery !== inputValue) {
      setShowResult(false);
      setSearching(true);
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
      <div
        className={`absolute  top-[9rem] lg:top-[3.45rem] overflow-scroll h-[var(--window-height)] bg-[#fcfefc]  dark:bg-slate-900 w-full  `}
      >
        <div className="flex items-center justify-center dark:text-gray-50  fixed top-1/3 lg:top-1/2 left-1/2 -translate-x-1/2 lg:-translate-y-1/2 -translate-y-1/3 gap-2 w-full">
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
          <p>searching...</p>
        </div>
      </div>
    );
  }

  if (isError || isPaused) {
    return (
      <div className="fixed inset-0 dark:bg-slate-900 bg-[#fcfefc]">
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2 px-3 ">
          <img
            src={`${
              theme === "dark"
                ? "/illustrations/server_down_dark.svg"
                : "/illustrations/server_down_light.svg"
            }`}
            alt="Server down"
            className=" w-40 h-36 "
          />
          <div className="font-semibold text-base">
            <p>Uh-oh! Couldn't fetch the decks and cards data for searching.</p>
            <p>Please check your internet connection.</p>
            <p>If you have a good internet connection,</p>
            <p>try refreshing the page.</p>
          </div>
          <button
            onClick={() => {
              navigate(-1);
              setOpenSearchBar(false);
            }}
            className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
            type="button"
            aria-label="Back"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" dark:text-white text-gray-800 fixed top-[6.5rem] h-12 flex items-start justify-center w-full bg-[#fcfefc] dark:bg-slate-900 z-50 lg:hidden font-bold pt-2 ">
        {searchQuery.length > 0 &&
          (foundDecks.length > 0 || foundCards.length > 0) &&
          showResult && (
            <div className="">
              {foundDecks.length + foundCards.length > 1 ? (
                <p>
                  Search Results
                  <span className="font-extralight text-xs ml-1 text-gray-600 dark:text-gray-300">
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
        className={`fixed  top-[9rem] lg:top-[3.45rem] overflow-scroll h-[var(--window-height)] bg-[#fcfefc]  dark:bg-slate-900 w-full  `}
      >
        <div className="hidden bg-[#fcfefc] fixed lg:top-[3.45rem] text-base dark:text-white text-gray-800 w-full lg:flex items-center justify-center dark:bg-slate-900 z-50 pb-4 pt-3">
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

        {searching && searchQuery.length > 0 && (
          <div className="flex items-center justify-center dark:text-gray-50  fixed top-1/3 lg:top-1/2 left-1/2 -translate-x-1/2 lg:-translate-y-1/2 -translate-y-1/3 gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
            <p>searching...</p>
          </div>
        )}

        {!(foundDecks.length > 0 && foundCards.length > 0) &&
          !searching &&
          !foundResults &&
          searchQuery.length > 0 && (
            <div
              className={`flex items-center justify-center z-50 w-screen h-full text-base font-semibold animate-quickOpacity`}
            >
              <div className="relative flex items-center justify-center flex-col lg:top-[-3.42rem] -top-[9rem] gap-2 ">
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
            </div>
          )}

        {(searchQuery.length > 0 && foundDecks.length > 0) ||
        foundCards.length > 0 ||
        inputValue.length > 0 ? (
          searchQuery === inputValue &&
          showResult &&
          inputValue.length > 0 &&
          foundResults && (
            <DeckAndCardResult
              foundDecks={foundDecks}
              foundCards={foundCards}
              setFoundDecks={setFoundDecks}
              setEditData={setEditData}
              editData={editData}
              searchQuery={searchQuery}
            />
          )
        ) : (
          <div
            className={`flex items-center justify-center z-50 w-screen h-full text-base font-semibold animate-quickOpacity`}
          >
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
          </div>
        )}
      </div>
      {openEditDeckModalForSearchResult ? (
        <EditModalForDeck
          openEditDeckModal={openEditDeckModalForSearchResult}
          editDeck={editDeck}
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
