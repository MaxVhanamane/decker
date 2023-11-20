import {
  ChangeEvent,
  FC,
  useContext,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiOutlineSearch } from "react-icons/ai";
import SearchResult from "./SearchResult";
import { RiCloseFill } from "react-icons/ri";
import { searchContext } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

const SearchBar: FC = () => {
  const { showSearchBar, setShowSearchBar, setOpenSearchBar, openSearchBar } =
    useContext(searchContext);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const deferredQuery = useDeferredValue(inputValue);
  const navigate = useNavigate();
  useEffect(() => {
    if (!openSearchBar && showSearchBar) {
      setOpenSearchBar(true);
    }
    if (!showSearchBar) {
      setOpenSearchBar(false);
    }
  }, [showSearchBar]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
  };
  useEffect(() => {
    if (!showSearchBar) {
      setInputValue("");
    }
  }, [showSearchBar]);
  return (
    <div className={` dark:bg-slate-900 fixed top-16 lg:relative lg:top-auto`}>
      <div
        onTransitionEnd={() => {
          if (searchBarRef.current && showSearchBar) {
            searchBarRef.current.focus();
          }
        }}
        className={`lg:relative lg:right-auto lg:translate-x-0 fixed w-full bg-[#fcfefc] dark:bg-slate-900 h-32 lg:h-auto top-[3.45rem] lg:top-auto transition-all duration-500 lg:duration-700  ${
          openSearchBar ? "left-0 lg:left-auto" : "left-full lg:left-auto"
        }`}
      >
        <div
          className={`lg:relative transform-gpu ${
            openSearchBar ? "w-72 right-1/2" : "w-0 right-0"
          } overflow-hidden  transition-all duration-500 lg:duration-700  lg:right-auto top-[3.85rem] lg:top-auto  fixed  translate-x-1/2 lg:translate-x-0  z-[80] bg-[#fcfefc] dark:bg-slate-900  `}
        >
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AiOutlineSearch className="dark:text-white text-gray-700 text-lg" />
          </div>
          <input
            ref={searchBarRef}
            value={inputValue}
            onChange={handleInputChange}
            type="text"
            id="simple-search"
            className="bg-gray-50 dark:bg-slate-800 border border-gray-400 dark:border-gray-400 text-gray-900 dark:text-white text-sm  block w-full pl-10 p-2 pr-8 dark:placeholder-gray-500   dark:focus:border-gray-100 dark:outline-none outline-gray-300 rounded-md "
            placeholder="Search for decks and cards"
            autoComplete="off"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <RiCloseFill
              onClick={() => {
                navigate(-1);
                setOpenSearchBar(false);
              }}
              className={`text-gray-400 dark:text-gray-400 ${
                showSearchBar ? "opactiy-100" : "opacity-0"
              } cursor-pointer transition-opacity duration-700 text-xl`}
            />
          </div>
        </div>
      </div>
      <div
        onTransitionEnd={() => {
          if (!openSearchBar) {
            setShowSearchBar(false);
          }
        }}
        className={`fixed  ${
          openSearchBar ? "left-0 " : "left-full"
        } transition-all duration-500 lg:duration-700  z-[90]`}
      >
        {showSearchBar && (
          <SearchResult searchQuery={deferredQuery} inputValue={inputValue} />
        )}
      </div>
    </div>
  );
};

export default SearchBar;

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
