import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  ReactNode,
} from "react";

interface ContexType {
  showSearchBar: boolean;
  setShowSearchBar: Dispatch<React.SetStateAction<boolean>>;
}
type SearchContextProvider = {
  children: ReactNode;
};
export const searchContext = createContext<ContexType>({
  showSearchBar: false,
  setShowSearchBar: () => {},
});

const SearchProvider = ({ children }: SearchContextProvider) => {
  const [showSearchBar, setShowSearchBar] = useState(false);

  return (
    <searchContext.Provider value={{ showSearchBar, setShowSearchBar }}>
      {children}
    </searchContext.Provider>
  );
};

export default SearchProvider;
