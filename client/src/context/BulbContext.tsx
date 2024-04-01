import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

type contextType = {
  showBulb: boolean;
  setShowSetBulb: Dispatch<SetStateAction<boolean>>;
  animationPlayed: boolean;
  setAnimationPlayed: Dispatch<SetStateAction<boolean>>;
};

export const BulbContext = createContext<contextType>({
  showBulb: true,
  setShowSetBulb: () => {},
  animationPlayed: false,
  setAnimationPlayed: () => {},
});

export const BulbContextProvider = ({ children }: { children: ReactNode }) => {
  const [showBulb, setShowSetBulb] = useState(() => {
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
  const [animationPlayed, setAnimationPlayed] = useState(false);

  return (
    <BulbContext.Provider
      value={{ showBulb, setShowSetBulb, animationPlayed, setAnimationPlayed }}
    >
      {children}
    </BulbContext.Provider>
  );
};
