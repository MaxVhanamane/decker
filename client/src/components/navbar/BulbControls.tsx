import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import {
  BrightnessContext,
  BulbAnimationContext,
  BulbContext,
} from "../../context/BulbContext";
import { AudioContext } from "../../context/AudioContext";
import { BsLightbulb, BsLightbulbOff } from "react-icons/bs";
import { twMerge } from "tailwind-merge";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useLocation } from "react-router-dom";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";

const BulbControls = () => {
  const { showBulb, setShowBulb } = useContext(BulbContext);
  const [showBulbControls, setShowBulbControls] = useState(false);
  const { showToast } = useContext(ShowToastContext);
  const location = useLocation();
  const { setAnimationPlayed, animationPlayed } =
    useContext(BulbAnimationContext);
  const { handlePlayAudio, isPlayingAudioAllowed } = useContext(AudioContext);
  const { bulbBrightness, setBulbBrightness } = useContext(BrightnessContext);
  const bulbOptionsContainer = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(
    bulbOptionsContainer,
    showBulbControls,
    () => {
      if (showBulbControls) {
        setShowBulbControls(false);
      }
    },
    { excludeRefs: [buttonRef] }
  );
  useFocusTrap(bulbOptionsContainer, "tab", {
    onEscape: () => {
      setShowBulbControls(false);
    },
    enabled: showBulbControls,
  });
  useEffect(() => {
    // If the user leaves the home page, we will stop the bulb from flickering. However, if the user keeps switching between the home page and cards or other pages, the flickering will continue because there won't be enough time for the animation to end. The animation is set to end only when it completes, at which point, I set 'animationPlayed' to true.
    if (!animationPlayed && !(location?.pathname === "/")) {
      setAnimationPlayed(true);
    }
  }, [location.pathname]);

  const handleIntensityChange = useCallback(
    (newIntensity: string) => {
      localStorage.setItem("bulbBrightness", newIntensity);
      setBulbBrightness(Number(newIntensity));
    },
    [setBulbBrightness]
  );
  const handleSwitchOnBulb = useCallback(() => {
    setShowBulbControls((prev) => !prev);
  }, []);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="plain"
        size="md"
        aria-label={
          showBulbControls ? "Close bulb controls" : "Open bulb controls"
        }
        toolTipText={
          showBulbControls ? "Close bulb controls" : "Open bulb controls"
        }
        withTooltip
        toolTipPosition="left"
        type="button"
        onClick={handleSwitchOnBulb}
        className="rounded-full p-[0.4rem] w-10 h-10 dark:hover:bg-gray-700 hover:bg-gray-100 "
      >
        {showBulb ? (
          <BsLightbulb className={`dark:text-gray-200 text-gray-500 `} />
        ) : (
          <BsLightbulbOff className={`dark:text-gray-200 text-gray-500 `} />
        )}
      </Button>

      <div
        ref={bulbOptionsContainer}
        className={twMerge(
          "absolute -left-40 top-12 w-48 transition-[transform,opacity] duration-300 flex flex-col items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 outline-none",
          showBulbControls
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        )}
      >
        {/* Bulb Visibility Control */}
        <div className="w-full flex flex-col items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">
            Bulb Visibility
          </h3>
          <div className="flex items-center justify-center gap-3">
            {[true, false].map((option) => (
              <label
                key={String(option)}
                htmlFor={`bulb-${option}`}
                className="flex items-center gap-2 cursor-pointer h-6"
              >
                <input
                  tabIndex={showBulbControls ? 0 : -1}
                  id={`bulb-${option}`}
                  type="radio"
                  name="bulbVisibility"
                  value={String(option)}
                  checked={showBulb === option}
                  onChange={() => {
                    if (option) {
                      setShowBulb(option);
                      setAnimationPlayed(false);
                      localStorage.setItem("showBulb", "true");
                      if (isPlayingAudioAllowed) {
                        handlePlayAudio("switchOnAudioSound");
                      }
                    } else {
                      setShowBulb(option);
                      localStorage.setItem("showBulb", "false");
                      if (isPlayingAudioAllowed) {
                        handlePlayAudio("switchOffAudioSound");
                      }
                    }
                  }}
                  className={twMerge(
                    "appearance-none w-4 h-4 rounded-full border-2 border-gray-400 relative transition-all duration-200 cursor-pointer focus-visible:ring-2  focus-visible:ring-gray-600 focus-visible:ring-offset-2 focus-visible:dark:ring-offset-slate-700 focus-visible:dark:ring-sky-200 focus-visible:ring-offset-gray-100 outline-none",
                    "checked:border-blue-500 dark:border-gray-500 dark:checked:border-sky-400",
                    "before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 checked:before:scale-100 checked:before:opacity-100",
                    "before:transition-transform before:duration-200 before:opacity-0"
                  )}
                />
                <span className="text-sm text-gray-700 dark:text-gray-50 capitalize leading-none">
                  {option ? "Show" : "Hide"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brightness Slider */}
        <div
          className={twMerge(
            "w-full flex flex-col items-center gap-2",
            !showBulb ? "opacity-30" : "opacity-100"
          )}
          onClick={() => {
            if (!showBulb) {
              showToast({
                message: "Oops! You need to show the bulb first!",
                severity: "info",
                position: "top-center",
              });
            }
          }}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">
            Brightness
          </h3>

          <input
            tabIndex={showBulbControls ? 0 : -1}
            type="range"
            min="10"
            max="100"
            value={bulbBrightness}
            onChange={(e) => {
              if (showBulb) {
                handleIntensityChange(e.target.value);
              }
            }}
            className={twMerge(
              "w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none focus-visible:ring-2  focus-visible:ring-gray-600 focus-visible:ring-offset-2 focus-visible:dark:ring-offset-slate-700 focus-visible:dark:ring-sky-200 focus-visible:ring-offset-gray-100 outline-none",
              showBulb ? "cursor-pointer" : "cursor-not-allowed"
            )}
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${bulbBrightness}%, #e5e7eb ${bulbBrightness}%, #e5e7eb 100%)`,
            }}
          />

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {bulbBrightness}%
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(BulbControls);
