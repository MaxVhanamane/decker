import { useCallback, useEffect, useRef, useState } from "react";
import { IoWarning } from "react-icons/io5";
import { MdInfo, MdCheckCircle } from "react-icons/md";
import type { AutoHideDurationValues, PositionValues } from "../../types/types";
import { BiSolidErrorAlt } from "react-icons/bi";
import Button from "../Button";

type PropType = {
  buttonText?: string;
  buttonHandler?: (() => void) | null;
  message: string;
  severity: "info" | "success" | "warning" | "error";
  position: PositionValues;
  autoHideDuration: AutoHideDurationValues;
  id: string;
  handleRemoveMessage: (id: string) => void;
  animationStyle?: "slide" | "scale-up";
  theme?: "auto" | "colored";
  progressBar: "show" | "hide";
};

const IconsBySeverity = {
  info: MdInfo,
  error: BiSolidErrorAlt,
  success: MdCheckCircle,
  warning: IoWarning,
};

const textColors = {
  error: "text-red-500",
  success: "text-green-500",
  warning: "text-yellow-400",
  info: "text-sky-500",
};

const toastBgColors = {
  error: "bg-red-600",
  success: "bg-green-700",
  warning: "bg-orange-500",
  info: "bg-sky-600",
};

const positionAnimation = {
  "top-left": {
    enter: "md:animate-animateFromLeftToRightToastLeft",
    exit: "animate-animateFromRightToLeftToastLeft",
  },
  "top-right": {
    enter: "md:animate-animateFromRightToLeftToastRight",
    exit: "animate-animateFromLeftToRightToastRight",
  },
  "top-center": {
    enter: "md:animate-[scaleUp90_0.15s]",
    exit: "animate-animateFromLeftToRightToastRight md:animate-[scaleDown100_0.1s_linear_forwards]",
  },
  "bottom-left": {
    enter: "md:animate-animateFromLeftToRightToastLeft",
    exit: "animate-animateFromRightToLeftToastLeft",
  },
  "bottom-right": {
    enter: "md:animate-animateFromRightToLeftToastRight",
    exit: "animate-animateFromLeftToRightToastRight",
  },
  "bottom-center": {
    enter: "md:animate-[scaleUp90_0.15s]",
    exit: "animate-animateFromLeftToRightToastRight md:animate-[scaleDown100_0.1s_linear_forwards]",
  },
};

const Toast = ({
  buttonText,
  buttonHandler,
  message,
  severity,
  autoHideDuration,
  id,
  handleRemoveMessage,
  position,
  animationStyle,
  theme,
  progressBar,
}: PropType) => {
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const [isMultipleLines, setIsMultipleLines] = useState(false);
  const toastRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (buttonText && buttonHandler && toastRef.current) {
      toastRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    if (paragraph) {
      const lineHeight = parseInt(
        window.getComputedStyle(paragraph).lineHeight
      );
      const elementHeight = paragraph?.clientHeight;

      // If element height is greater than line height, text is on multiple lines
      setIsMultipleLines(elementHeight > lineHeight);
    }
  }, [message]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, autoHideDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoHideDuration]);

  const Icon = IconsBySeverity[severity];

  // Track when the progress bar animation completes
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (!visible && e.animationName !== "scaleUp") {
      handleRemoveMessage(id);
    }
  };

  const startProgressBarAnimation = useCallback(() => {
    if (
      progressBar === "show" &&
      progressBarRef.current &&
      !hasMounted.current
    ) {
      const progressElement = progressBarRef.current;

      // Create animation using Web Animations API
      progressElement.animate([{ width: "100%" }, { width: "0%" }], {
        duration: autoHideDuration,
        easing: "linear",
        fill: "forwards",
      });
    }
  }, [progressBar, autoHideDuration, hasMounted.current]);

  useEffect(() => {
    // Start the hide timeout
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, autoHideDuration);

    if (!hasMounted.current) {
      startProgressBarAnimation();

      hasMounted.current = true;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoHideDuration, startProgressBarAnimation, hasMounted.current]);

  // Animation classes for the toast container
  const getAnimationClasses = () => {
    if (visible) {
      if (!hasMounted.current) {
        return animationStyle === "slide"
          ? `animate-animateFromRightToLeftMobile ${positionAnimation[position].enter}`
          : "animate-[scaleUp90_0.15s]";
      } else {
        // Skip animation after mount
        return "";
      }
    } else {
      return animationStyle === "slide"
        ? positionAnimation[position].exit
        : "animate-[scaleDown100_0.1s_linear_forwards]";
    }
  };

  return (
    <div
      ref={toastRef}
      tabIndex={-1}
      onAnimationEnd={handleAnimationEnd}
      className={`w-full relative md:w-fit h-fit flex items-center justify-center outline-none 
        ${getAnimationClasses()}
        ${isMultipleLines ? "p-2" : "p-3"}
        ${
          theme === "auto"
            ? "bg-gray-200 dark:text-gray-50 dark:bg-slate-700 text-gray-800"
            : `${toastBgColors[severity]} text-gray-50`
        }
        shadow-md overflow-hidden font-semibold rounded-lg z-[90] max-w-md flex items-center justify-center
        ${isMultipleLines ? "gap-3" : "gap-2"}
        ${visible && !(buttonText && buttonHandler) && "cursor-pointer"}`}
      onClick={() => {
        // If the toast has a button like 'undo', we will not dismiss the toast when the user clicks on it. This ensures that if the user clicks by mistake, it won't close because it has a button and the operation might be important.
        if (visible && !(buttonText && buttonHandler)) {
          setVisible(false);
        }
      }}
    >
      {progressBar === "show" && (
        <div
          ref={progressBarRef}
          className={`absolute bottom-0 left-0 h-[3px] rounded-b-xl ${
            theme === "auto"
              ? severity === "error"
                ? "bg-red-500"
                : severity === "success"
                ? "bg-green-500"
                : severity === "warning"
                ? "bg-yellow-400"
                : "bg-sky-500"
              : "bg-gray-50"
          }`}
          style={{ width: "100%" }}
        />
      )}
      <Icon
        className={`w-fit ${isMultipleLines ? "text-3xl " : "text-2xl"} ${
          theme === "auto" ? textColors[severity] : "text-gray-50"
        } ${
          visible && animationStyle === "slide"
            ? position === "top-center" || position === "bottom-center"
              ? "animate-[scaleUp_0.2s_ease-in]"
              : " animate-[scaleUp_0.6s_ease-in]"
            : "animate-[scaleUp_0.2s_ease-in]"
        }`}
      />
      <p
        ref={paragraphRef}
        className="text-base font-sans font-normal text-left flex-1"
      >
        {message}
      </p>
      {buttonText && buttonHandler && (
        <Button
          variant="unstyled"
          className={`cursor-pointer font-bold px-0.5 rounded-sm ${
            theme === "auto"
              ? "text-green-500 dark:text-lime-400"
              : "text-white"
          }`}
          onClick={() => {
            buttonHandler();
            clearTimeout(timeoutRef.current!);
            setVisible(false);
          }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default Toast;
