import { ReactNode, useRef, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

type NavigateFunction = ReturnType<typeof useNavigate>;

const StableNavigateContext = createContext<NavigateFunction | undefined>(
  undefined
);

export const StableNavigateContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigate = useNavigate();
  const navigateRef = useRef<NavigateFunction>(navigate);

  return (
    <StableNavigateContext.Provider value={navigateRef.current}>
      {children}
    </StableNavigateContext.Provider>
  );
};

export const useStableNavigate = () => {
  const context = useContext(StableNavigateContext);
  if (!context) {
    throw new Error(
      "useStableNavigate must be used within a StableNavigateContextProvider"
    );
  }
  return context;
};
