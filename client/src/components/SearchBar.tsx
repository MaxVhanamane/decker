import { FC, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import SearchResult from "./SearchResult";
import { RiCloseFill } from "react-icons/ri";
import { searchContext } from "../context/SearchContext";

const SearchBar: FC = () => {
  const { showSearchBar, setShowSearchBar } = useContext(searchContext);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  useEffect(() => {
    if (searchBarRef.current && showSearchBar) {
      searchBarRef.current.focus();
    }
  }, [showSearchBar]);

  const handleInputChange = (event: any) => {
    const { value } = event.target;
    setSearchQuery(value);
  };

  return (
    <div className={` bg-slate-800 fixed top-14 lg:relative lg:top-auto`}>
      <div
        className={`lg:relative ${
          showSearchBar ? "w-72 right-1/2" : "w-0 right-0"
        } overflow-hidden transition-all duration-500 lg:duration-700  lg:right-auto  fixed  translate-x-1/2 lg:translate-x-0  z-[80] bg-white dark:bg-[#0c1221] rounded-md `}
      >
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <AiOutlineSearch className="dark:text-white text-gray-700 text-lg" />
        </div>
        <input
          ref={searchBarRef}
          value={searchQuery}
          onChange={handleInputChange}
          type="text"
          id="simple-search"
          className="bg-gray-50 dark:bg-gray-800 border border-gray-400 dark:border-gray-400 text-gray-900 dark:text-white text-sm rounded-md  block w-full pl-10 p-2 pr-8 dark:placeholder-gray-500   dark:focus:border-gray-100 dark:outline-none outline-gray-300  "
          placeholder="Search for decks and cards"
          autoComplete="off"
          required
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <RiCloseFill
            onClick={() => {
              setShowSearchBar(false), setSearchQuery("");
            }}
            className={`text-gray-400 dark:text-gray-400 ${
              showSearchBar ? "opactiy-100" : "opacity-0"
            } cursor-pointer transition-opacity duration-700`}
          />
        </div>
      </div>
      <div
        className={`fixed  ${
          showSearchBar ? "left-0" : "left-full"
        } transition-all duration-500 lg:duration-700 `}
      >
        {showSearchBar && (
          <SearchResult
            searchQuery={searchQuery}
            setShowSearchBar={setShowSearchBar}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
