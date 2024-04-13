import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useCallback,
  useState,
  useContext,
  useEffect,
} from "react";
import { Droppable } from "react-beautiful-dnd";
import { BulbContext } from "../context/BulbContext";

export type ChangeBulbColor = {
  setBulbColor: (color: string) => void;
  resetBulbColor: (color: string, isDraggingOverDeleteArea?: boolean) => void;
};
const Bulb = forwardRef<ChangeBulbColor, {}>((_, ref) => {
  const bulbContainerRef = useRef<HTMLDivElement | null>(null);
  const spanOneRef = useRef<HTMLSpanElement | null>(null);
  const spanTwoRef = useRef<HTMLSpanElement | null>(null);
  const mainDivRef = useRef<HTMLDivElement | null>(null);
  const [swingBulb, setSwingBulb] = useState(false);
  const { showBulb, animationPlayed, setAnimationPlayed } =
    useContext(BulbContext);

  const removeColor = useCallback(
    (color: string, isDraggingOverDeleteArea?: boolean) => {
      switch (color) {
        case "red": {
          bulbContainerRef.current?.classList.remove(
            "before:!bg-red-400",
            "!bg-red-400",
            "!shadow-bulb",
            "!shadow-red-600"
          );
          spanOneRef.current?.classList.remove(
            "!shadow-[12px_12px_0_4.5px_#f87171]"
          );
          spanTwoRef.current?.classList.remove(
            "!shadow-[-12px_12px_0_4.5px_#f87171]"
          );
          break;
        }

        case "fuchsia": {
          if (isDraggingOverDeleteArea) {
            bulbContainerRef.current?.classList.remove(
              "before:!bg-fuchsia-400",
              "!bg-fuchsia-400",
              "!shadow-fuchsia-700"
            );
          } else {
            bulbContainerRef.current?.classList.remove(
              "before:!bg-fuchsia-400",
              "!bg-fuchsia-400",
              "!shadow-bulb",
              "!shadow-fuchsia-700"
            );
          }
          spanOneRef.current?.classList.remove(
            "!shadow-[12px_12px_0_4.5px_#e879f9]"
          );
          spanTwoRef.current?.classList.remove(
            "!shadow-[-12px_12px_0_4.5px_#e879f9]"
          );
          break;
        }

        case "lime": {
          if (isDraggingOverDeleteArea) {
            bulbContainerRef.current?.classList.remove(
              "before:!bg-lime-400",
              "!bg-lime-400",
              "!shadow-lime-600"
            );
          } else {
            bulbContainerRef.current?.classList.remove(
              "before:!bg-lime-400",
              "!bg-lime-400",
              "!shadow-bulb",
              "!shadow-lime-600"
            );
          }
          spanOneRef.current?.classList.remove(
            "!shadow-[12px_12px_0_4.5px_#a3e635]"
          );
          spanTwoRef.current?.classList.remove(
            "!shadow-[-12px_12px_0_4.5px_#a3e635]"
          );
          break;
        }
      }
    },
    []
  );

  const addColor = useCallback((color: string) => {
    switch (color) {
      case "red": {
        bulbContainerRef.current?.classList.add(
          "before:!bg-red-400",
          "!bg-red-400",
          "!shadow-bulb",
          "!shadow-red-600"
        );
        spanOneRef.current?.classList.add(
          "!shadow-[12px_12px_0_4.5px_#f87171]"
        );
        spanTwoRef.current?.classList.add(
          "!shadow-[-12px_12px_0_4.5px_#f87171]"
        );
        break;
      }
      case "fuchsia": {
        bulbContainerRef.current?.classList.add(
          "before:!bg-fuchsia-400",
          "!bg-fuchsia-400",
          "!shadow-bulb",
          "!shadow-fuchsia-700"
        );
        0;

        spanOneRef.current?.classList.add(
          "!shadow-[12px_12px_0_4.5px_#e879f9]"
        );
        spanTwoRef.current?.classList.add(
          "!shadow-[-12px_12px_0_4.5px_#e879f9]"
        );
        break;
      }
      case "lime": {
        bulbContainerRef.current?.classList.add(
          "before:!bg-lime-400",
          "!bg-lime-400",
          "!shadow-bulb",
          "!shadow-lime-600"
        );
        spanOneRef.current?.classList.add(
          "!shadow-[12px_12px_0_4.5px_#a3e635]"
        );
        spanTwoRef.current?.classList.add(
          "!shadow-[-12px_12px_0_4.5px_#a3e635]"
        );
        break;
      }
    }
  }, []);

  useImperativeHandle(ref, () => ({
    setBulbColor: (color: string) => {
      addColor(color);
      spanOneRef.current?.classList.remove(
        "shadow-[12px_12px_0_4.5px_#38bdf8]"
      );
      spanTwoRef.current?.classList.remove(
        "shadow-[-12px_12px_0_4.5px_#38bdf8]"
      );
    },
    resetBulbColor: (color: string, isDraggingOverDeleteArea?: boolean) => {
      removeColor(color, isDraggingOverDeleteArea);
      spanOneRef.current?.classList.add("shadow-[12px_12px_0_4.5px_#38bdf8]");
      spanTwoRef.current?.classList.add("shadow-[-12px_12px_0_4.5px_#38bdf8]");
    },
  }));

  return (
    <Droppable droppableId="bulbArea">
      {(provided, snapshot) => {
        if (
          snapshot.isDraggingOver &&
          !mainDivRef?.current?.classList.contains("animate-swingBulb")
        ) {
          mainDivRef?.current?.classList?.add("animate-swingBulb");
        }

        return (
          <div
            onAnimationEnd={() => {
              setSwingBulb(false);
              if (
                mainDivRef?.current?.classList?.contains("animate-swingBulb")
              ) {
                mainDivRef?.current?.classList?.remove("animate-swingBulb");
              }
            }}
            className={`fixed h-fit top-[3.4rem] lg:right-8 lg:top-12 w-12  right-5 transition-opacity duration-500 ${
              swingBulb ? "animate-swingBulb" : ""
            }  origin-top ${
              showBulb ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            ref={(element) => {
              // Call your own ref
              mainDivRef.current = element;
              // Call the library provided ref
              provided.innerRef(element);
            }}
            {...provided.droppableProps}
          >
            <div className="relative w-1 md:h-28 h-[7.5rem] left-1/2 -translate-x-1/2 dark:bg-[#080e23] bg-gray-700 z-30 "></div>
            <div
              onClick={() => {
                setSwingBulb(true);
              }}
              ref={bulbContainerRef}
              onAnimationEnd={(e) => {
                e.stopPropagation();

                setAnimationPlayed(true);
              }}
              className={`relative w-12 h-12  rounded-full z-20 before:absolute before:content-[''] before:-top-[30px] before:left-[13.5px] before:w-[21px] before:h-12  before:border-top-[18px] dark:before:border-[#080e23] before:border-gray-700 before:border-solid before:border-t-[18px] before:rounded-[8px] cursor-pointer ${
                showBulb && !animationPlayed
                  ? "dark:animate-flickerDark animate-flickerLight dark:before:animate-flickerBgDark before:animate-flickerBgLight"
                  : "bg-[#38bdf8] shadow-[0px_0px_175px_100px_#0284c7] before:bg-[#38bdf8]"
              } top-7 ${
                !showBulb
                  ? "dark:before:!bg-gray-800 dark:!bg-gray-800 bg-gray-400 before:bg-gray-400 shadow-none"
                  : ""
              } `}
            >
              <span
                ref={spanOneRef}
                className={`absolute -top-[9.6px] -left-[1.8px] block w-[18px] h-[18px] bg-transparent rotate-[345deg] border-transparent rounded-br-[24px]  ${
                  showBulb && !animationPlayed
                    ? "dark:animate-flickerShadowLeftExtraSmallDark animate-flickerShadowLeftExtraSmallLight shadow-[12px_12px_0_4.5px_#1e293b]"
                    : "shadow-[12px_12px_0px_4.5px_#38bdf8]"
                }  ${
                  !showBulb
                    ? "dark:shadow-[12px_12px_0px_4.5px_#1e293b] shadow-[12px_12px_0px_4.5px_#9ca3af]"
                    : ""
                }`}
              ></span>
              <span
                ref={spanTwoRef}
                className={`absolute -top-[9.6px] -right-[1.8px] block w-[18px] h-[18px] bg-transparent rotate-[14deg] border-transparent rounded-bl-[24px]  ${
                  showBulb && !animationPlayed
                    ? "dark:animate-flickerShadowRightExtraSmallDark animate-flickerShadowRightExtraSmallLight shadow-[-12px_12px_0_4.5px_#1e293b]"
                    : "shadow-[-12px_12px_0px_4.5px_#38bdf8]"
                }  ${
                  !showBulb
                    ? "dark:shadow-[-12px_12px_0px_4.5px_#1e293b] shadow-[-12px_12px_0px_4.5px_#9ca3af]"
                    : ""
                }`}
              ></span>
              <div className="flex items-center justify-center flex-col absolute -top-[13px] left-1/2 -translate-x-1/2">
                <div className="w-[11px] border-t-0 border-b-0 border h-6 border-[#020617]"></div>
                <div className="relative border border-solid border-[#020617] w-[11px] h-[5.5px] rounded-[50%] z-20 -top-[1.5px]"></div>
                <div className="relative border border-solid border-[#020617] w-[11px] h-[5.5px] rounded-[50%] z-20 -top-[3.5px]"></div>
                <div className="relative border border-solid border-[#020617] w-[11px] h-[5.5px] rounded-[50%] z-20 -top-[6.5px]"></div>
              </div>
            </div>
          </div>
        );
      }}
    </Droppable>
  );
});

export default Bulb;
