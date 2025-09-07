import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useIsDeviceType } from "../hooks/utility/useIsDeviceType";

type createContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: (value: boolean) => void;
};

export const SidebarContex = createContext<createContextType>({
  isSidebarOpen: true,
  toggleSidebar: () => {},
});

type SidebarContextProviderProps = {
  children: ReactNode;
};

export const SidebarContextProvider = ({
  children,
}: SidebarContextProviderProps) => {
  const isMobileOrTablet = useIsDeviceType("tablet");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const value = localStorage.getItem("isSidebarOpen");
    return value && !isMobileOrTablet
      ? JSON.parse(value)
      : isMobileOrTablet
      ? false
      : true;
  });

  const toggleSidebar = useCallback((value: boolean) => {
    localStorage.setItem("isSidebarOpen", JSON.stringify(value));
    setIsSidebarOpen(value);
  }, []);
  const values = useMemo(() => {
    return { isSidebarOpen, toggleSidebar };
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <SidebarContex.Provider value={values}>{children}</SidebarContex.Provider>
  );
};
