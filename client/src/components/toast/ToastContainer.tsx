import { memo, useContext, useEffect, useMemo, useState } from "react";

import Toast from "./Toast";
import { ToastNotificationContext } from "../../context/ToastNotificationContext";
import type { AutoHideDurationValues, PositionValues } from "../../types/types";
import { twMerge } from "tailwind-merge";

type PropType = {
  globalPosition?: PositionValues;
  globalAutoHideDuration?: AutoHideDurationValues;
};

type MessageType = {
  message: string;
  severity: "info" | "success" | "warning" | "error";
  autoHideDuration: AutoHideDurationValues;
  position: PositionValues;
  buttonText?: string;
  buttonHandler?: (() => void) | null;
  id: string;
  animationStyle?: "slide" | "scale-up";
  theme?: "auto" | "colored";
  progressBar: "show" | "hide";
};

const ToastContainer = ({
  globalPosition,
  globalAutoHideDuration,
}: PropType) => {
  const { allToasts, handleRemoveMessage, setGlobalValues } = useContext(
    ToastNotificationContext
  );
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    setGlobalValues({ globalPosition, globalAutoHideDuration });
  }, [globalPosition, globalAutoHideDuration]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group toasts by position
  // On mobile screens, we can't show toasts at specific positions like "bottom-right" or "top-left".
  // Instead of displaying toasts at different top positions (e.g., "top-left", "top-right"),
  // we will combine all top-positioned toasts and show them in the center.
  // The same applies to bottom-positioned toasts.
  const { toastsByPosition, topMessages, bottomMessages } = useMemo(() => {
    return allToasts.reduce(
      (acc, toast) => {
        if (!acc.toastsByPosition[toast.position]) {
          acc.toastsByPosition[toast.position] = [];
        }
        acc.toastsByPosition[toast.position].push(toast);

        if (toast.position.startsWith("top-")) {
          acc.topMessages.push(toast);
        } else if (toast.position.startsWith("bottom-")) {
          acc.bottomMessages.push(toast);
        }

        return acc;
      },
      {
        toastsByPosition: {} as Record<string, MessageType[]>,
        topMessages: [] as MessageType[],
        bottomMessages: [] as MessageType[],
      }
    );
  }, [allToasts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[90] ">
      {isSmallScreen && topMessages.length > 0 && (
        <div className="absolute top-1 flex flex-col items-center  gap-2 w-full h-[80vh] py-5 px-4 ">
          <ol
            className=" flex items-center justify-center gap-2 flex-col pointer-events-auto overflow-y-auto overflow-x-hidden"
            role="region"
            aria-live="polite"
          >
            {topMessages.map((toastInfo) => {
              return (
                <li key={toastInfo.id}>
                  <Toast
                    {...toastInfo}
                    handleRemoveMessage={handleRemoveMessage}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      )}
      {isSmallScreen && bottomMessages.length > 0 && (
        <div className="absolute bottom-2 flex flex-col-reverse gap-2 items-center w-full h-[80vh]  py-5 px-4">
          <ol
            className="flex items-center justify-center gap-2 flex-col-reverse pointer-events-auto overflow-y-auto overflow-x-hidden"
            role="region"
            aria-live="polite"
          >
            {bottomMessages.map((toastInfo) => {
              return (
                <li key={toastInfo.id}>
                  <Toast
                    {...toastInfo}
                    handleRemoveMessage={handleRemoveMessage}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      )}
      {!isSmallScreen &&
        Object.keys(toastsByPosition).map((position) => {
          return (
            <div
              key={position}
              className={`
            ${
              position === "top-left"
                ? "absolute top-6 left-0 px-4 h-[80vh]  py-6"
                : position === "top-right"
                ? "absolute top-4 right-0 px-4 h-[80vh]   py-6"
                : position === "top-center"
                ? "absolute top-0 left-1/2 -translate-x-1/2  h-[80vh]  py-2"
                : position === "bottom-left"
                ? "absolute bottom-4 left-0 px-4 h-[80vh] py-6 "
                : position === "bottom-right"
                ? "absolute bottom-4 right-0 px-4 h-[80vh]  py-6"
                : position === "bottom-center"
                ? "absolute bottom-0 left-1/2 -translate-x-1/2 h-[80vh]  py-2"
                : ""
            } w-[28.5rem] `}
            >
              <ol
                className={twMerge(
                  `flex gap-2 items-center h-full overflow-y-auto overflow-x-hidden scrollbar-gutter `,
                  position.startsWith("bottom")
                    ? "flex-col-reverse justify-start"
                    : "flex-col",
                  (position === "bottom-right" || position === "top-right") &&
                    "items-end",
                  (position === "bottom-left" || position === "top-left") &&
                    "items-start"
                )}
                role="region"
                aria-live="polite"
              >
                {toastsByPosition[position].map((toastInfo) => {
                  return (
                    <li key={toastInfo.id} className=" pointer-events-auto">
                      <Toast
                        {...toastInfo}
                        handleRemoveMessage={handleRemoveMessage}
                      />
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
    </div>
  );
};

export default memo(ToastContainer);
