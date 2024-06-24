import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const audioSource = {
  switchOnAudioSound: "/audio/switch-on.mp3",
  switchOffAudioSound: "/audio/switch-off.mp3",
  deletedSuccessfully: "/audio/deletedSuccessfully.mp3",
  createdSuccessfully: "/audio/createdSuccessfully.mp3",
  enable: "/audio/enable.mp3",
  disable: "/audio/disable.mp3",
  open: "/audio/open.mp3",
  close: "/audio/close.mp3",
};

type AudioNamesType =
  | "switchOnAudioSound"
  | "switchOffAudioSound"
  | "createdSuccessfully"
  | "deletedSuccessfully"
  | "open"
  | "close"
  | "enable"
  | "disable";

type ContextType = {
  handlePlayAudio: (audioName: AudioNamesType, path?: string) => void;
  isPlayingAudioAllowed: boolean;
  setIsPlayingAudioAllowed: Dispatch<SetStateAction<boolean>>;
  pathnameForAudio: MutableRefObject<string | null>;
};

export const AudioContext = createContext<ContextType>({
  handlePlayAudio: () => {},
  isPlayingAudioAllowed: false,
  setIsPlayingAudioAllowed: () => {},
  pathnameForAudio: { current: null },
});

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audio] = useState(new Audio());
  const isPlaying = useRef(false);
  const pathnameForAudio = useRef(null);

  const [isPlayingAudioAllowed, setIsPlayingAudioAllowed] = useState(() => {
    const allowPlayingAudio = localStorage.getItem("isPlayingAudioAllowed");
    if (allowPlayingAudio !== null) {
      const parsedValue = JSON.parse(allowPlayingAudio);
      if (typeof parsedValue === "boolean") {
        return parsedValue;
      }
    }
    return true;
  });

  const handlePlayAudio = useCallback(
    (audioName: AudioNamesType, path?: string) => {
      //If the user is on the "/cards" page and performs an action that triggers a sound, such as deleting a card, and then immediately navigates to the home page ("/"), we will not play the sound. This decision is based on the understanding that there is no need to play the sound when the user has already left the page.
      if (
        (path && !path.startsWith("/cards") && path !== location?.pathname) ||
        (path === "/cards" && !location.pathname.startsWith("/cards"))
      ) {
        return;
      }

      if (
        audio.src === audioSource[audioName] &&
        !audio.paused &&
        isPlaying.current
      ) {
        // If the same audio is already playing, pause and reset
        audio.pause();
        audio.currentTime = 0;
        isPlaying.current = false;
      } else {
        // Load and play the new audio
        audio.src = audioSource[audioName];

        isPlaying.current = true;
        audio.muted = false;

        audio.play();
      }
    },
    [isPlaying.current, audio]
  );

  useEffect(() => {
    // Initially, upon page load, the audio is muted as browsers typically do not permit sound playback without direct user interaction, such as a click event. Consequently, if you drag and drop the deck into the delete area before clicking any button that triggers sound, you won't hear anything, and an error will be logged in the browser console.
    audio.muted = true;
    const handleAudioEnded = () => {
      audio.pause();
      audio.currentTime = 0;
      isPlaying.current = false;
      audio.muted = true;
    };

    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      // Cleanup: Remove event listener when the component unmounts
      audio.removeEventListener("ended", handleAudioEnded);
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        handlePlayAudio,
        isPlayingAudioAllowed,
        setIsPlayingAudioAllowed,

        pathnameForAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
