import {
  ReactNode,
  createContext,
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import type {
  AutoHideDurationValues,
  PositionValues,
  ToastHandlerType,
  ToastMessageType,
} from "../types/types";
type GlobalValuesType = {
  globalPosition: PositionValues | undefined;
  globalAutoHideDuration: AutoHideDurationValues | undefined;
};

type ToastNotificationContextType = {
  allToasts: ToastMessageType[];
  setGlobalValues: Dispatch<SetStateAction<GlobalValuesType>>;
  handleRemoveMessage: (id: string) => void;
};

type ShowToastContextType = { showToast: (newToast: ToastHandlerType) => void };

export const ToastNotificationContext =
  createContext<ToastNotificationContextType>({
    allToasts: [],
    setGlobalValues: () => {},
    handleRemoveMessage: () => {},
  });

export const ShowToastContext = createContext<ShowToastContextType>({
  showToast: () => {},
});

export const ToastNotificationContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [allToasts, setAllToasts] = useState<ToastMessageType[]>([]);

  const [globalValues, setGlobalValues] = useState<GlobalValuesType>({
    globalPosition: undefined,
    globalAutoHideDuration: undefined,
  });

  const isMessageEqual = useCallback(
    (
      a: Omit<ToastMessageType, "id">,
      b: Omit<ToastMessageType, "id">
    ): boolean => {
      return (
        a.message === b.message &&
        a.severity === b.severity &&
        a.autoHideDuration === b.autoHideDuration &&
        a.position === b.position &&
        a.buttonText === b.buttonText &&
        a.buttonHandler === b.buttonHandler &&
        a.animationStyle === b.animationStyle &&
        a.theme === b.theme &&
        a.progressBar === b.progressBar
      );
    },
    []
  );

  const showToast = useCallback(
    (newToast: ToastHandlerType) => {
      if (newToast?.message) {
        const normalizedNewToast: Omit<ToastMessageType, "id"> = {
          message: newToast?.message ?? "",
          severity: newToast?.severity ?? "info",
          position:
            newToast?.position || globalValues.globalPosition || "bottom-right",
          buttonText: newToast?.buttonText || "",
          buttonHandler: newToast?.buttonHandler || null,
          autoHideDuration:
            newToast?.autoHideDuration ||
            globalValues.globalAutoHideDuration ||
            5000,
          animationStyle: newToast?.animationStyle ?? "scale-up",
          theme: newToast?.theme ?? "auto",
          progressBar: newToast?.progressBar ?? "show",
        };

        setAllToasts((prevToasts) => {
          const alreadyExists = prevToasts.some((toastInfo) =>
            isMessageEqual(toastInfo, normalizedNewToast)
          );

          if (!alreadyExists) {
            return [
              ...prevToasts,
              {
                ...normalizedNewToast,
                id: crypto.randomUUID(),
              },
            ];
          }

          return prevToasts;
        });
      }
    },
    [globalValues]
  );

  const handleRemoveMessage = useCallback((id: string) => {
    setAllToasts((previousMessages) =>
      previousMessages.filter((toastInfo) => {
        return toastInfo.id !== id;
      })
    );
  }, []);

  let ShowToastContextValue = useMemo(() => ({ showToast }), [showToast]);

  const ToastNotificationContextValue = useMemo(() => {
    return { setGlobalValues, handleRemoveMessage, allToasts };
  }, [allToasts, handleRemoveMessage]);

  return (
    <ToastNotificationContext.Provider value={ToastNotificationContextValue}>
      <ShowToastContext.Provider value={ShowToastContextValue}>
        {children}
      </ShowToastContext.Provider>
    </ToastNotificationContext.Provider>
  );
};
