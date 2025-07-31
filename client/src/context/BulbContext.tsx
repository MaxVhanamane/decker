import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChangeBulbColor } from "../components/Bulb";
import type { bulbColors } from "../types/types";

type BulbContextType = {
  showBulb: boolean;
  setShowBulb: Dispatch<SetStateAction<boolean>>;
  bulbRef: RefObject<ChangeBulbColor>;
  removeBulbColorAfterTimeout: (
    color: bulbColors,
    duration: number,
    callback?: () => void
  ) => void;
};

type BrightnessContextType = {
  bulbBrightness: number;
  setBulbBrightness: Dispatch<SetStateAction<number>>;
};

export const BrightnessContext = createContext<BrightnessContextType>({
  bulbBrightness: 100,
  setBulbBrightness: () => {},
});

type BulbAnimationContextType = {
  animationPlayed: boolean;
  setAnimationPlayed: Dispatch<SetStateAction<boolean>>;
};

export const BulbContext = createContext<BulbContextType>({
  showBulb: true,
  setShowBulb: () => {},
  bulbRef: { current: null },
  removeBulbColorAfterTimeout: () => {},
});

export const BulbAnimationContext = createContext<BulbAnimationContextType>({
  animationPlayed: false,
  setAnimationPlayed: () => {},
});

export const BulbContextProvider = ({ children }: { children: ReactNode }) => {
  const bulbRef = useRef<ChangeBulbColor>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [bulbBrightness, setBulbBrightness] = useState<number>(() => {
    const stored = localStorage.getItem("bulbBrightness");
    // If there's no value at all, initialize to 100
    if (stored === null) {
      localStorage.setItem("bulbBrightness", "100");
      return 100;
    }
    const parsed = Number(stored);
    // If the stored value is invalid (not a number)
    if (isNaN(parsed)) {
      localStorage.setItem("bulbBrightness", "100");
      return 100;
    }
    const clamped = Math.min(100, Math.max(10, parsed)); // Clamp between 10 and 100

    if (clamped !== parsed) {
      localStorage.setItem("bulbBrightness", clamped.toString());
    }
    return clamped;
  });

  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [showBulb, setShowBulb] = useState(() => {
    let bulbValue = localStorage.getItem("showBulb");
    const allowedValues = ["true", "false"];
    if (bulbValue && !allowedValues.includes(bulbValue)) {
      localStorage.setItem("showBulb", "true");
    }

    if (bulbValue === "true") {
      return true;
    } else if (bulbValue === "false") {
      return false;
    } else {
      localStorage.setItem("showBulb", "true");
      return true;
    }
  });
  const removeBulbColorAfterTimeout = useCallback(
    (color: bulbColors, duration = 4500, callback?: () => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        bulbRef.current?.removeBulbColor(color);
        if (callback) {
          callback();
        }
        timeoutRef.current = null;
      }, duration);
    },
    [bulbRef]
  );

  const bulbContextValue = useMemo(() => {
    return {
      showBulb,
      setShowBulb,
      bulbRef,
      removeBulbColorAfterTimeout,
    };
  }, [showBulb, setShowBulb, bulbRef, removeBulbColorAfterTimeout]);

  const bulbBrightnessContextValue = useMemo(
    () => ({ bulbBrightness, setBulbBrightness }),
    [bulbBrightness, setBulbBrightness]
  );

  const bulbAnimationContextValue = useMemo(() => {
    return {
      animationPlayed,
      setAnimationPlayed,
    };
  }, [animationPlayed, setAnimationPlayed]);

  return (
    <BulbContext.Provider value={bulbContextValue}>
      <BulbAnimationContext.Provider value={bulbAnimationContextValue}>
        <BrightnessContext.Provider value={bulbBrightnessContextValue}>
          {children}
        </BrightnessContext.Provider>
      </BulbAnimationContext.Provider>
    </BulbContext.Provider>
  );
};
