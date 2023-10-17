import React, { createContext, useState, Dispatch, ReactNode } from "react";

type cardInfo = {
  cardIndex: null | number;
  title: string;
  note: string;
  _id: string;
  from: string;
  cardId: string;
};
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
  cardInfo: cardInfo;
  setCardInfo: Dispatch<React.SetStateAction<cardInfo>>;
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
  cardInfo: {
    cardIndex: null,
    title: "",
    note: "",
    _id: "",
    from: "",
    cardId: "",
  },
  setCardInfo: () => {},
});

const SearchProvider = ({ children }: SearchContextProvider) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [openSearchBar, setOpenSearchBar] = useState(false);
  const [cardDeleted, setCardDeleted] = useState(false);
  const [cardInfo, setCardInfo] = useState<cardInfo>({
    cardIndex: null,
    title: "",
    note: "",
    _id: "",
    from: "",
    cardId: "",
  });
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
        cardInfo,
        setCardInfo,
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
