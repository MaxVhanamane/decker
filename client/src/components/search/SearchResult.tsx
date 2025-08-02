import {
  useEffect,
  useContext,
  memo,
  SetStateAction,
  Dispatch,
  useRef,
  useState,
} from "react";
import { UserContext } from "../../context/UserContext";
import { searchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import DeckAndCardResult from "./DeckAndCardResult";
import EmptySearchState from "./EmptySearchState";
import useGetSearchResult, {
  getSearchResult,
} from "../../hooks/react-query/useGetSearchResult";
import Pagination from "../Pagination";
import { DeckCardSearchResult, DeckSearchResult } from "../../types/types";
import { useQueryClient } from "@tanstack/react-query";
import { usePrismTheme } from "../../hooks/utility/usePrismTheme";
import { ThemeContext } from "../../context/ThemeContext";

// types
type SearchResultProps = {
  searchQuery: string;
  closeSearchBar: (deckId: string) => void;
  searchCount: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};
const SearchResult = ({
  searchQuery,
  closeSearchBar,
  searchCount,
  page,
  setPage,
}: SearchResultProps) => {
  const { setAnimateSearchBar } = useContext(searchContext);
  const { setUserInfo, setUserEmailAddress } = useContext(UserContext);
  const [hasPageSwitched, setHasPageSwitched] = useState(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useState({ page: 1, query: "" });

  const {
    data: searchResult,
    refetch,
    isError,
    error,
    isLoading,
  } = useGetSearchResult({
    limit: 20,
    page,
    query: searchQuery,
  });
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  usePrismTheme(theme);

  useEffect(() => {
    if (searchCount > 0 && searchQuery) {
      const cached = queryClient.getQueryData([
        "searchResult",
        searchQuery,
        page,
      ]);
      if (!cached) {
        refetch();
      }
      setHasPageSwitched(false);
      setSearchParams({ page, query: searchQuery });
    }
  }, [searchCount, searchQuery, page]);

  useEffect(() => {
    if (
      searchQuery &&
      searchCount > 0 &&
      searchResult?.data?.totalPages &&
      page < searchResult.data.totalPages
    ) {
      queryClient.prefetchQuery({
        queryKey: ["searchResult", searchQuery, page + 1],
        queryFn: ({ signal }) =>
          getSearchResult(
            { query: searchQuery, page: page + 1, limit: 20 },
            signal
          ),
      });
    }
  }, [searchQuery, page, searchCount, queryClient, searchResult]);

  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [page]);

  useEffect(() => {
    if (error) {
      if (
        error?.message ===
        "Your session has expired. Please log in again to continue."
      ) {
        setUserInfo(null);
        setUserEmailAddress(null);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("wasPreviouslyLoggedIn");

        navigate("/sessionexpired", { replace: true });
      }
    }
  }, [error]);

  const foundDecks = (searchResult?.data?.results?.filter(
    (item) => item.type === "deck"
  ) || []) as DeckSearchResult[];

  const foundCards = (searchResult?.data?.results?.filter(
    (item) => item.type === "deck-card"
  ) || []) as DeckCardSearchResult[];

  const hasFoundResults =
    (foundDecks && foundDecks.length > 0) ||
    (foundCards && foundCards.length > 0);

  if (isLoading || (hasPageSwitched && !searchResult?.data)) {
    return (
      <div
        className={`absolute h-[var(--window-height)] bg-white  dark:bg-slate-900 w-full  `}
      >
        <div className="flex flex-col items-center justify-center dark:text-gray-50  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  gap-4 w-full">
          <img
            src="/illustrations/searching.svg"
            alt="Image depicting a person searching through a library of card"
            className="lg:w-44 lg:h-44 w-40 h-40 "
          />
          <div className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>
            <p>{page === 1 ? "Searching..." : "Fetching more results"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 top-[64px] dark:bg-slate-900 bg-white z-10">
        <div className=" w-full  h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2 px-3">
          <div className="flex items-center justify-center flex-col gap-2 ">
            <img
              src="/illustrations/server_down_error.svg"
              alt="Server down"
              className="w-40 h-28"
            />
            <div className="font-semibold text-sm">
              <p>
                Uh-oh! Couldn't fetch the decks and cards data for searching.
              </p>
              <p>Please check your internet connection.</p>
              <p>If you have a good internet connection,</p>
              <p>try refreshing the page.</p>
            </div>
            <button
              onClick={() => {
                setAnimateSearchBar(false);
              }}
              className=" mt-4 inline-block py-2.5 font-medium text-sm leading-tight rounded active:shadow-lg text-gray-50 w-[7.3rem] bg-sky-600 hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
              type="button"
              aria-label="Back"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!searchQuery.length) {
    return <EmptySearchState />;
  }

  return (
    <div
      className={` bg-white dark:bg-slate-900 w-full h-[var(--window-height)]`}
    >
      {hasFoundResults ? (
        <>
          <div className=" bg-white  h-14  text-base dark:text-white text-gray-800 w-full flex items-center justify-center dark:bg-slate-900 z-50">
            <div className=" font-bold">
              {foundDecks.length + foundCards.length > 1 ? (
                <p>
                  Search Results
                  <span className="font-light text-xs  ml-1 text-gray-800 dark:text-gray-300">
                    (about {searchResult?.data?.total} results)
                  </span>
                </p>
              ) : (
                <p>Search Result</p>
              )}
            </div>
          </div>
          <div
            ref={scrollableContainerRef}
            className="overflow-y-auto dark:dark-scrollbar light-scrollbar lg:h-[calc(var(--window-height)-7.5rem)] h-[calc(var(--window-height)-10.5rem)]"
          >
            <DeckAndCardResult
              foundDecks={foundDecks}
              foundCards={foundCards}
              searchQuery={searchQuery}
              closeSearchBar={closeSearchBar}
              searchParams={searchParams}
            />
            {searchResult?.data && (
              <Pagination
                currentPage={searchResult?.data.page}
                totalPages={searchResult?.data?.totalPages}
                onPageChange={(page) => {
                  setHasPageSwitched(true);
                  setPage(page);
                }}
              />
            )}
          </div>
        </>
      ) : (
        <div
          className={`relative flex items-center justify-center  z-50 w-screen text-base font-semibold animate-quickOpacity h-[var(--window-height)] `}
        >
          <div className="relative flex items-center justify-center flex-col  -top-[4rem] gap-2 ">
            <img
              src="/illustrations/no_result_found.svg"
              alt="No result found image"
              className="w-52 h-44 "
            />
            <p className="text-gray-800 dark:text-gray-50 ml-4 text-lg">
              No result found!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SearchResult);
