import { memo, useContext, useImperativeHandle, useState } from "react";
import { PopupContext } from "../context/PopupContext";

export type PopUpHandlerType = {
  show: (
    message: string,
    autoHideDuration?: number,
    newButtonText?: string,
    newButtonHandler?: () => void
  ) => void;
};
let timoutId: NodeJS.Timeout;
const PopUpMessage = () => {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [buttonHandler, setButtonHandler] = useState<(() => void) | null>(null);
  const popupRef = useContext(PopupContext);

  useImperativeHandle(
    popupRef,
    () => ({
      show(
        newMessage,
        autoHideDuration = 5000,
        newButtonText,
        newButtonHandler
      ) {
        clearTimeout(timoutId);
        setMessage(newMessage);
        if (newButtonText && newButtonHandler) {
          setButtonText(newButtonText);
          setButtonHandler(() => newButtonHandler);
        } else {
          setButtonText("");
          setButtonHandler(null);
        }

        setVisible(true);
        timoutId = setTimeout(() => setVisible(false), autoHideDuration);
      },
    }),
    []
  );

  return (
    <div
      onTransitionEnd={() => {
        if (!visible) {
          setButtonText("");
          setMessage("");
        }
      }}
      className={`fixed bottom-10 md:right-20 right-1/2 translate-x-1/2 md:translate-x-0 transition duration-500 ease-in-out w-[80%] h-fit ${
        visible ? "scale-100" : "scale-0"
      } border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800 font-semibold rounded-lg z-[90] dark:text-gray-50 p-3 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500`}
    >
      <div className="flex items-center justify-center gap-2">
        <p>{message}</p>
        {buttonText && buttonHandler && (
          <button
            className="cursor-pointer font-bold text-blue-700 dark:text-yellow-400"
            onClick={() => {
              buttonHandler();

              setVisible(false);
            }}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(PopUpMessage);
