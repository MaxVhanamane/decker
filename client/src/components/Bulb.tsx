import {
  useRef,
  useImperativeHandle,
  useCallback,
  useState,
  useContext,
  memo,
  useEffect,
  useMemo,
} from "react";

import {
  BrightnessContext,
  BulbAnimationContext,
  BulbContext,
} from "../context/BulbContext";
import type { bulbColors } from "../types/types";
import { ThemeContext } from "../context/ThemeContext";
import { twMerge } from "tailwind-merge";

export type ChangeBulbColor = {
  setBulbColor: (color: bulbColors) => void;
  removeBulbColor: (color: bulbColors) => void;
  readonly colorName: bulbColors | "";
};

type BulbProps = {
  shouldDimBulb?: boolean;
};

// Color configuration with RGB values for shadows
const colorConfig = {
  red: {
    rgb: "220, 38, 38", // red-600
    tailwindBg: "!bg-red-400",
    tailwindShadow: "!shadow-red-600",
    beforeTailwindBg: "before:!bg-red-400",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#f87171]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#f87171]",
    tungstenWireStroke: "#fecaca", // red-200
  },
  yellow: {
    rgb: "234, 179, 8", // yellow-500
    tailwindBg: "!bg-yellow-400",
    tailwindShadow: "!shadow-yellow-500",
    beforeTailwindBg: "before:!bg-yellow-400",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#facc15]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#facc15]",
    tungstenWireStroke: "#fef08a", // yellow-200
  },
  fuchsia: {
    rgb: "162, 28, 175", // fuchsia-700
    tailwindBg: "!bg-fuchsia-400",
    tailwindShadow: "!shadow-fuchsia-700",
    beforeTailwindBg: "before:!bg-fuchsia-400",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#e879f9]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#e879f9]",
    tungstenWireStroke: "#f5d0fe", // fuchsia-200
  },
  lime: {
    rgb: "101, 163, 13", // lime-600
    tailwindBg: "!bg-lime-400",
    tailwindShadow: "!shadow-lime-600",
    beforeTailwindBg: "before:!bg-lime-400",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#a3e635]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#a3e635]",
    tungstenWireStroke: "#d9f99d", // lime-200
  },
  violet: {
    rgb: "139, 92, 246", // violet-500
    tailwindBg: "!bg-violet-400",
    tailwindShadow: "!shadow-violet-500",
    beforeTailwindBg: "before:!bg-violet-400",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#a78bfa]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#a78bfa]",
    tungstenWireStroke: "#ddd6fe", // violet-200
  },
  cyan: {
    rgb: "0, 221, 221", // Custom cyan
    tailwindBg: "!bg-[#00DDDD]",
    tailwindShadow: "!shadow-[#00DDDD]",
    beforeTailwindBg: "before:!bg-[#00DDDD]",
    spanShadowLeft: "!shadow-[12px_12px_0_4.5px_#00DDDD]",
    spanShadowRight: "!shadow-[-12px_12px_0_4.5px_#00DDDD]",
    tungstenWireStroke: "#a5f3fc", // cyan-200
  },
};

const Bulb = memo(({ shouldDimBulb }: BulbProps) => {
  const bulbContainerRef = useRef<HTMLDivElement | null>(null);
  const spanOneRef = useRef<HTMLSpanElement | null>(null);
  const tungstenWireRef = useRef<SVGGElement | null>(null);
  const wireRef = useRef<HTMLDivElement | null>(null);
  const spanTwoRef = useRef<HTMLSpanElement | null>(null);
  const [swingBulb, setSwingBulb] = useState(false);
  const { showBulb, bulbRef } = useContext(BulbContext);
  const { bulbBrightness, setBulbBrightness } = useContext(BrightnessContext);
  const { theme } = useContext(ThemeContext);
  const { setAnimationPlayed, animationPlayed } =
    useContext(BulbAnimationContext);
  const activeColorRef = useRef<bulbColors | "">("");

  // Helper function to adjust color opacity based on intensity
  const getIntensityMultiplier = useCallback(() => {
    const minInput = 10;
    const maxInput = 100;

    const minOutput = 0.5;
    const maxOutput = 1.0;

    const normalized = (bulbBrightness - minInput) / (maxInput - minInput); // 0 to 1
    return minOutput + normalized * (maxOutput - minOutput);
  }, [bulbBrightness]);

  // Helper function to get shadow blur based on intensity
  const getShadowBlur = useCallback(() => {
    const baseBlur = 175;
    const baseSpread = 100;
    const multiplier = getIntensityMultiplier();
    return {
      blur: Math.round(baseBlur * multiplier),
      spread: Math.round(baseSpread * multiplier),
    };
  }, [getIntensityMultiplier]);

  // Calculate initial styles based on current intensity
  const initialBulbStyles = useMemo(() => {
    if (!showBulb) {
      return {};
    }

    const multiplier = getIntensityMultiplier();
    const { blur, spread } = getShadowBlur();

    return {
      opacity: Math.max(0.2, multiplier),
      boxShadow: `0px 0px ${blur}px ${spread}px rgba(2, 132, 199, ${multiplier})`,
    };
  }, [showBulb, getIntensityMultiplier, getShadowBlur]);

  useEffect(() => {
    if (shouldDimBulb) {
      setBulbBrightness(10);
      return;
    }
    const savedBrightness = Number(localStorage.getItem("bulbBrightness"));

    // Validate brightness: must be a number between 10 and 100
    if (
      !isNaN(savedBrightness) &&
      savedBrightness >= 10 &&
      savedBrightness <= 100
    ) {
      setBulbBrightness(savedBrightness);
    } else {
      localStorage.setItem("bulbBrightness", "50");
      setBulbBrightness(50);
    }
  }, [shouldDimBulb]);

  useEffect(() => {
    // When bulb is flickering and user starts draggin item it changes to some color as in the background animation is still running when it ends it resets the set color of bulb even if you are draggin a bulb to solve that issue I am turning off the flickring animation if user starts draggin when flickering is still going on.
    if (animationPlayed && activeColorRef.current) {
      addColor(activeColorRef.current);
      spanOneRef.current?.classList.remove(
        "shadow-[12px_12px_0_4.5px_#38bdf8]"
      );
      spanTwoRef.current?.classList.remove(
        "shadow-[-12px_12px_0_4.5px_#38bdf8]"
      );
    }
  }, [animationPlayed, activeColorRef.current]);

  const removeColor = useCallback((color: bulbColors) => {
    const config = colorConfig[color];
    if (!config) return;

    bulbContainerRef.current?.classList.remove(
      `${config.tailwindBg}`,
      `${config.beforeTailwindBg}`,
      `${config.tailwindShadow}`
    );
    spanOneRef.current?.classList.remove(config.spanShadowLeft);
    spanTwoRef.current?.classList.remove(config.spanShadowRight);

    // Clear custom shadow
    if (bulbContainerRef.current) {
      bulbContainerRef.current.style.boxShadow = "";
    }
  }, []);

  const addColor = useCallback((color: bulbColors) => {
    const config = colorConfig[color];
    if (!config) return;

    bulbContainerRef.current?.classList.add(
      `${config.tailwindBg}`,
      `${config.beforeTailwindBg}`,
      `${config.tailwindShadow}`
    );
    spanOneRef.current?.classList.add(config.spanShadowLeft);
    spanTwoRef.current?.classList.add(config.spanShadowRight);
  }, []);

  // Set CSS custom properties for animation to respect brightness
  useEffect(() => {
    if (bulbContainerRef.current) {
      const { blur, spread } = getShadowBlur();
      const multiplier = getIntensityMultiplier();

      // Set CSS custom properties that the animation can use
      bulbContainerRef.current.style.setProperty(
        "--flicker-shadow-blur",
        `${blur}px`
      );
      bulbContainerRef.current.style.setProperty(
        "--flicker-shadow-spread",
        `${spread}px`
      );
      bulbContainerRef.current.style.setProperty(
        "--flicker-opacity",
        multiplier.toString()
      );
      bulbContainerRef.current.style.setProperty(
        "--flicker-shadow-color",
        `rgba(2, 132, 199, ${multiplier})`
      );
    }
  }, [bulbBrightness, getShadowBlur, getIntensityMultiplier]);

  // Apply intensity effect to the bulb
  const applyIntensityEffect = useCallback(() => {
    if (bulbContainerRef.current && wireRef.current) {
      const multiplier = getIntensityMultiplier();
      const { blur, spread } = getShadowBlur();

      // Apply opacity to the entire bulb
      bulbContainerRef.current.style.opacity = Math.max(
        0.2,
        multiplier
      ).toString();
      if (theme === "light") {
        wireRef.current.style.opacity = Math.max(0.2, multiplier).toString();
      }

      // Apply dynamic shadow based on intensity and active color
      if (activeColorRef.current && colorConfig[activeColorRef.current]) {
        const config = colorConfig[activeColorRef.current];
        bulbContainerRef.current.style.boxShadow = `0px 0px ${blur}px ${spread}px rgba(${config.rgb}, ${multiplier})`;
        if (tungstenWireRef.current) {
          tungstenWireRef.current.style.stroke =
            colorConfig[activeColorRef.current].tungstenWireStroke;
        }
      } else {
        // Default sky blue bulb with intensity-based shadow
        bulbContainerRef.current.style.boxShadow = `0px 0px ${blur}px ${spread}px rgba(2, 132, 199, ${multiplier})`;
        if (tungstenWireRef.current) {
          tungstenWireRef.current.style.stroke =
            colorConfig["cyan"].tungstenWireStroke;
        }
      }
    }
  }, [getIntensityMultiplier, getShadowBlur, activeColorRef.current, theme]);

  // Apply intensity whenever it changes
  useEffect(() => {
    applyIntensityEffect();
  }, [bulbBrightness, applyIntensityEffect]);

  useImperativeHandle(
    bulbRef,
    () => ({
      setBulbColor: function (color: bulbColors) {
        if (!animationPlayed) {
          setAnimationPlayed(true);
          activeColorRef.current = color;
          return;
        }

        activeColorRef.current = color;

        addColor(color);
        spanOneRef.current?.classList.remove(
          "shadow-[12px_12px_0_4.5px_#38bdf8]"
        );
        spanTwoRef.current?.classList.remove(
          "shadow-[-12px_12px_0_4.5px_#38bdf8]"
        );

        applyIntensityEffect();
      },
      removeBulbColor: (color: bulbColors) => {
        activeColorRef.current = "";

        removeColor(color);

        spanOneRef.current?.classList.add("shadow-[12px_12px_0_4.5px_#38bdf8]");
        spanTwoRef.current?.classList.add(
          "shadow-[-12px_12px_0_4.5px_#38bdf8]"
        );

        applyIntensityEffect();
      },

      get colorName() {
        return activeColorRef.current || "";
      },
    }),
    [animationPlayed, applyIntensityEffect, addColor, removeColor]
  );

  return (
    <div
      onAnimationEnd={() => {
        setSwingBulb(false);
      }}
      className={`fixed h-fit top-[3.9rem] lg:right-8  w-12  right-5 transition-opacity duration-500 pointer-events-none ${
        swingBulb ? "animate-swingBulb" : ""
      }  origin-top ${showBulb ? "opacity-100" : "opacity-0 "}`}
    >
      <div
        ref={wireRef}
        className={twMerge(
          "relative left-1/2 -translate-x-1/2 w-10 md:h-28 h-[7.5rem] z-30 transition-all duration-300",
          shouldDimBulb && "opacity-50"
        )}
      >
        <svg viewBox="0 0 100 800" className="w-full h-full">
          <path
            d="M50,0 
           Q70,40 50,80 
           Q30,120 50,160 
           Q70,200 50,240 
           Q30,280 50,320 
           Q70,360 50,400 
           Q30,440 50,480 
           Q70,520 50,560 
           Q30,600 50,640 
           Q70,680 50,720 
           Q30,760 50,800"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            className="dark:stroke-[#080e23] stroke-gray-600"
          />
        </svg>
      </div>
      <div
        onClick={() => {
          setSwingBulb(true);
        }}
        ref={bulbContainerRef}
        onAnimationEnd={(e) => {
          e.stopPropagation();
          setAnimationPlayed(true);
        }}
        style={initialBulbStyles}
        className={`mt-0.5 relative w-12 h-12  rounded-full z-20 before:absolute before:content-[''] before:-top-[30px] before:left-[13.5px] before:w-[21px] before:h-12  before:border-top-[18px] dark:before:border-[#080e23] before:border-gray-600 before:border-solid before:border-t-[18px] before:rounded-[8px] cursor-pointer transition-all duration-300 before:transition-all before:duration-300 pointer-events-auto  ${
          showBulb && !animationPlayed
            ? "dark:animate-flickerDark animate-flickerLight dark:before:animate-flickerBgDark before:animate-flickerBgLight"
            : "bg-[#38bdf8] before:bg-[#38bdf8]"
        } top-7 ${
          !showBulb
            ? "dark:before:!bg-gray-800 dark:!bg-gray-800 bg-gray-400 before:bg-gray-400 shadow-none "
            : ""
        } `}
      >
        <span
          ref={spanOneRef}
          className={`absolute -top-[9.6px] -left-[1.8px] block w-[18px] h-[18px] bg-transparent rotate-[345deg] border-transparent rounded-br-[24px] transition-all duration-300  ${
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
          className={`absolute -top-[9.6px] -right-[1.8px] block w-[18px] h-[18px] bg-transparent rotate-[14deg] border-transparent rounded-bl-[24px] transition-shadow duration-300  ${
            showBulb && !animationPlayed
              ? "dark:animate-flickerShadowRightExtraSmallDark animate-flickerShadowRightExtraSmallLight shadow-[-12px_12px_0_4.5px_#1e293b]"
              : "shadow-[-12px_12px_0px_4.5px_#38bdf8]"
          }  ${
            !showBulb
              ? "dark:shadow-[-12px_12px_0px_4.5px_#1e293b] shadow-[-12px_12px_0px_4.5px_#9ca3af]"
              : ""
          }`}
        ></span>
        <div className="flex items-center justify-center flex-col absolute -top-[10.5px] left-1/2 -translate-x-1/2">
          <div className="h-[22px] w-[7px] border-[1px] border-[#080e23] border-t-0 opacity-40 absolute -top-0.5 rounded-b-md"></div>
          <div className="absolute -top-0.5 ">
            <svg width="24" height="45" viewBox="50 0 40 100">
              <g
                strokeWidth="1.2"
                fill="none"
                opacity="0.8"
                transform="scale(1,0.85)"
                ref={tungstenWireRef}
                className={`transition-all duration-300 ${
                  showBulb &&
                  !animationPlayed &&
                  "animate-flickerStrokeTungsten"
                }`}
              >
                <line
                  x1="63"
                  y1="0"
                  x2="48"
                  y2="90"
                  className="stroke-[#080e23]"
                  strokeWidth="2"
                  opacity={0.4}
                />

                <line
                  x1="77"
                  y1="0"
                  x2="92"
                  y2="90"
                  className="stroke-[#080e23]"
                  strokeWidth="2"
                  opacity={0.4}
                />
                <line
                  x1="65"
                  y1="54"
                  x2="48"
                  y2="90"
                  className="stroke-[#080e23]"
                  strokeWidth="2"
                  opacity={0.4}
                />

                <line
                  x1="75"
                  y1="54"
                  x2="92"
                  y2="90"
                  className="stroke-[#080e23]"
                  strokeWidth="2"
                  opacity={0.4}
                />

                <path
                  d="M 48 90 
     Q 58 100, 64 90 
     Q 70 100, 76 90 
     Q 82 100, 92 90"
                  strokeWidth="3"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

Bulb.displayName = "Bulb";
export default Bulb;
