import React, {
  createContext,
  useState,
  Dispatch,
  ReactNode,
  useMemo,
} from "react";

interface ContexType {
  showSearchBar: boolean;
  setShowSearchBar: Dispatch<React.SetStateAction<boolean>>;
  animateSearchBar: boolean;
  setAnimateSearchBar: Dispatch<React.SetStateAction<boolean>>;
}

type SearchContextProvider = {
  children: ReactNode;
};

export const searchContext = createContext<ContexType>({
  showSearchBar: false,
  setShowSearchBar: () => {},
  animateSearchBar: false,
  setAnimateSearchBar: () => {},
});

const SearchProvider = ({ children }: SearchContextProvider) => {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [animateSearchBar, setAnimateSearchBar] = useState(false);

  const memoisedValue = useMemo(() => {
    return {
      showSearchBar,
      setShowSearchBar,
      animateSearchBar,
      setAnimateSearchBar,
    };
  }, [showSearchBar, animateSearchBar, setShowSearchBar, setAnimateSearchBar]);

  return (
    <searchContext.Provider value={memoisedValue}>
      {children}
    </searchContext.Provider>
  );
};

export default SearchProvider;
