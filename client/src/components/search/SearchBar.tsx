import {
  ChangeEvent,
  KeyboardEvent,
  lazy,
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { RiCloseFill } from "react-icons/ri";
import { searchContext } from "../../context/SearchContext";
import { useAudio } from "../../context/AudioContext";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import { VerticalDivider } from "../VerticalDivider";
import { twMerge } from "tailwind-merge";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import LoadingCentered from "../Loading/LoadingCentered";
import { OfflineContext } from "../../context/OfflineContext";
const SearchResult = lazy(() => import("./SearchResult"));
const SearchBar = () => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const {
    showSearchBar,
    setShowSearchBar,
    setAnimateSearchBar,
    animateSearchBar,
  } = useContext(searchContext);
  const { showToast } = useContext(ShowToastContext);
  const { isOnline } = useContext(OfflineContext);
  const { handlePlayAudio } = useAudio();
  const [inputValue, setInputValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  useModalBackNavigationHandler({
    isOpen: animateSearchBar,
    modalKey: "showSearchBar",
    closeModal: () => setAnimateSearchBar(false),
  });

  useEffect(() => {
    setAnimateSearchBar(showSearchBar);
    if (!showSearchBar) {
      // If the user closes the search bar using the browser's back button and then clicks on the cards, it keeps opening the keyboard on phones.To avoid that, we will unfocus the input once the search bar is closed.
      searchBarRef?.current?.blur();
    }
  }, [showSearchBar]);

  useEffect(() => {
    if (!showSearchBar) {
      setInputValue("");
      setSearchCount(0);
      setSearchQuery("");
      setPage(1);
    }
  }, [showSearchBar]);

  const closeSearchBar = useCallback((deckId: string) => {
    setAnimateSearchBar(false);
    setInputValue("");
    setSearchQuery("");
    setTimeout(() => {
      navigate(`cards/${deckId}`);
    }, 100);
  }, []);

  const handleSearch = () => {
    if (!isOnline) {
      showToast({
        message:
          "Looks like you're offline. Connect to the internet to search.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return;
    }
    const input = inputValue.trim().replace(/\s+/g, " ");
    if (input.length < 2) {
      showToast({
        message: "Search query must be at least 2 characters long.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return;
    }
    setSearchQuery(input);
    setSearchCount((prev) => prev + 1);
    setPage(1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!isOnline) {
        showToast({
          message:
            "Looks like you're offline. Connect to the internet to search.",
          severity: "error",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });
        return;
      }
      handleSearch();
      searchBarRef?.current?.blur();
    } else if (e.key === "Escape") {
      setAnimateSearchBar(false);
      setInputValue("");
      setSearchQuery("");
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };

  return (
    <div className={`fixed top-16 lg:relative lg:top-auto`}>
      <div
        className={`lg:relative lg:right-auto lg:translate-x-0 fixed w-full bg-white dark:bg-slate-900 h-12 lg:h-auto top-16 lg:top-auto transition-all duration-500    ${
          animateSearchBar ? "left-0 lg:left-auto" : "left-full lg:left-auto"
        }`}
      >
        <div
          onTransitionEnd={(e) => {
            //If the user closes the keyboard and then tries to switch between light and dark mode, the input will be focused, potentially opening the keyboard. To prevent this behavior, we will refrain from opening the keyboard if the transition property name is anything other than 'width'.
            if (e.propertyName !== "width") return;
            if (searchBarRef.current && animateSearchBar) {
              searchBarRef?.current?.focus();
            }
          }}
          className={`lg:relative transform-gpu ${
            animateSearchBar ? "w-72 right-1/2" : "w-0 right-0"
          } overflow-hidden  transition-all duration-500  lg:right-auto top-[4.3rem] lg:top-auto  fixed  translate-x-1/2 lg:translate-x-0  z-[80] bg-white dark:bg-slate-900  `}
        >
          <div className="p-1">
            <input
              ref={searchBarRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              type="text"
              className="
    bg-gray-50 dark:bg-slate-800
    border border-gray-300 dark:border-slate-600
    text-gray-900 dark:text-white
    text-sm block w-full pl-3 pr-[4.5rem] py-2
    placeholder-gray-400 dark:placeholder-slate-500
    rounded-md
    outline-none
     focus:border-slate-400 dark:focus:border-slate-500
  focus:ring-1 focus:ring-slate-400 dark:ring-slate-500
    transition-all duration-200
  "
              placeholder="Search decks and cards"
              autoComplete="off"
              required
            />
          </div>
          <div
            className={twMerge(
              "absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity ",
              animateSearchBar ? "opacity-100 delay-300" : "opacity-0"
            )}
          >
            <Button
              variant="unstyled"
              withTooltip
              toolTipText="Search"
              className="rounded-full p-0.5"
              onClick={handleSearch}
            >
              <AiOutlineSearch
                className={`text-gray-500 dark:text-gray-200 dark:hover:text-gray-400 hover:text-gray-400  cursor-pointer transition-[opacity,color] duration-500 text-lg`}
              />
            </Button>

            <VerticalDivider />
            <Button
              variant="unstyled"
              withTooltip
              toolTipText="Close Search bar"
              className="rounded-md"
            >
              <RiCloseFill
                onClick={() => {
                  setAnimateSearchBar(false);
                  setInputValue("");
                  setTimeout(() => {
                    handlePlayAudio("close");
                  }, 100);
                }}
                className={`text-gray-500 dark:text-gray-200  dark:hover:text-gray-400 hover:text-gray-400 cursor-pointer transition-[opacity,color] duration-500 text-xl`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div
        onTransitionEnd={() => {
          if (!animateSearchBar && showSearchBar) {
            setShowSearchBar(false);
          }
        }}
        className={`fixed top-[7rem] lg:top-16 inset-0  ${
          animateSearchBar
            ? "left-0 lg:opacity-100 "
            : "left-full  lg:opacity-0"
        } transition-all lg:transition-opacity duration-500 lg:duration-300 z-[90] w-full`}
      >
        {showSearchBar && (
          <Suspense
            fallback={
              <div className="h-full bg-white dark:bg-slate-900">
                {" "}
                <LoadingCentered
                  message="Loading search page"
                  subMessage="You can start typing your query while the page finishes loading."
                  inSearchSuspense={true}
                />
              </div>
            }
          >
            <SearchResult
              searchQuery={searchQuery}
              searchCount={searchCount}
              closeSearchBar={closeSearchBar}
              page={page}
              setPage={setPage}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default memo(SearchBar);

// if you want to close the searchbar when user clicks outside the search bar you can use following code
// const handleClickOutside = (event:globalThis.MouseEvent) => {
//     if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
//       setShowSearchBar(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

// {navigationDeck?.title && (
//   <div className="fixed inset-0 top-16 z-[90]  flex items-center justify-center flex-col gap-1 dark:bg-slate-900 bg-white text-inherit">
//     <img
//       src={"/illustrations/opening_deck.svg"}
//       alt="Opening deck"
//       className=" w-40 h-36 "
//     />
//     <p className="text-gray-700 dark:text-gray-50 flex items-center justify-center gap-2 -mr-4">
//       <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-200 border-t-2 dark:border-t-cyan-500 border-t-cyan-500 animate-spin"></span>{" "}
//       Opening {navigationDeck?.title} deck...
//     </p>
//   </div>
// )}
