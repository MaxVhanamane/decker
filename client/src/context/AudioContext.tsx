import {
  Dispatch,
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
  handlePlayAudio: (audioName: AudioNamesType) => void;
  isPlayingAudioAllowed: boolean;
  setIsPlayingAudioAllowed: Dispatch<SetStateAction<boolean>>;
};

export const AudioContext = createContext<ContextType>({
  handlePlayAudio: (audioName) => {},
  isPlayingAudioAllowed: false,
  setIsPlayingAudioAllowed: () => {},
});

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [audio] = useState(new Audio());
  const isPlaying = useRef(false);

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
    (audioName: AudioNamesType) => {
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
