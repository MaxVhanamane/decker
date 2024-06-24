import React, { createContext, useState, Dispatch, ReactNode } from "react";

interface ContexType {
  showSearchBar: boolean;
  cardDeleted: boolean;
  setShowSearchBar: Dispatch<React.SetStateAction<boolean>>;
  openEditDeckModalForSearchResult: boolean;
  setOpenEditDeckModalForSearchResult: Dispatch<React.SetStateAction<boolean>>;
  openSearchBar: boolean;
  setOpenSearchBar: Dispatch<React.SetStateAction<boolean>>;
  animateCloseEditDeckModalInSearchResult: boolean;
  setAnimateCloseEditDeckModalInSearchResult: Dispatch<
    React.SetStateAction<boolean>
  >;
  setCardDeleted: Dispatch<React.SetStateAction<boolean>>;
}

type SearchContextProvider = {
  children: ReactNode;
};

export const searchContext = createContext<ContexType>({
  showSearchBar: false,
  cardDeleted: false,
  setShowSearchBar: () => {},
  animateCloseEditDeckModalInSearchResult: false,
  setAnimateCloseEditDeckModalInSearchResult: () => {},
  openEditDeckModalForSearchResult: false,
  setOpenEditDeckModalForSearchResult: () => {},
  openSearchBar: false,
  setOpenSearchBar: () => {},
  setCardDeleted: () => {},
});

const SearchProvider = ({ children }: SearchContextProvider) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [openSearchBar, setOpenSearchBar] = useState(false);
  const [cardDeleted, setCardDeleted] = useState(false);

  const [
    animateCloseEditDeckModalInSearchResult,
    setAnimateCloseEditDeckModalInSearchResult,
  ] = useState(false);
  const [
    openEditDeckModalForSearchResult,
    setOpenEditDeckModalForSearchResult,
  ] = useState(false);
  return (
    <searchContext.Provider
      value={{
        showSearchBar,
        setShowSearchBar,
        openSearchBar,
        setOpenSearchBar,
        animateCloseEditDeckModalInSearchResult,
        setAnimateCloseEditDeckModalInSearchResult,
        openEditDeckModalForSearchResult,
        setOpenEditDeckModalForSearchResult,
        cardDeleted,
        setCardDeleted,
      }}
    >
      {children}
    </searchContext.Provider>
  );
};

export default SearchProvider;
