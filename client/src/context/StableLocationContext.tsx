import { ReactNode, useRef, createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

type LocationType = ReturnType<typeof useLocation>;

const StableLocationContext = createContext<LocationType | undefined>(
  undefined
);

export const StableLocationContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const location = useLocation();
  const locationRef = useRef<LocationType>(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  return (
    <StableLocationContext.Provider value={locationRef.current}>
      {children}
    </StableLocationContext.Provider>
  );
};

export const useStableLocation = () => {
  const context = useContext(StableLocationContext);
  if (!context) {
    throw new Error(
      "useStableLocation must be used within a StableLocationContextProvider"
    );
  }
  return context;
};
