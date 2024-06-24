import { ReactNode, RefObject, createContext, useRef } from "react";
import { PopUpHandlerType } from "../components/PopUpMessage";

type PopupContextType = RefObject<PopUpHandlerType | null>;

export const PopupContext = createContext<PopupContextType>({ current: null });

export const PopupContextProvider = ({ children }: { children: ReactNode }) => {
  const popupRef = useRef<PopUpHandlerType | null>(null);

  return (
    <PopupContext.Provider value={popupRef}>{children}</PopupContext.Provider>
  );
};
