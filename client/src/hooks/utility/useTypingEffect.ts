import { Dispatch, useEffect, useState } from "react";

export const useTypingEffect = (
    totalChars: number,
    speed: number = 10,
    enabled: boolean = false,
    skipTyping: boolean = false,
    setSkipTyping: Dispatch<React.SetStateAction<boolean>>
) => {
    const [visibleChars, setVisibleChars] = useState(enabled ? 0 : totalChars);
    const [isComplete, setIsComplete] = useState(!enabled);
    // Reset typing when enabled becomes true

    useEffect(() => {
        if (skipTyping) {
            setVisibleChars(totalChars);
            setIsComplete(true);
            setSkipTyping(false);
            return;
        }
    }, [skipTyping]);

    useEffect(() => {
        if (enabled) {
            setVisibleChars(0);
            setIsComplete(false);
        } else {
            setVisibleChars(totalChars);
            setIsComplete(true);
        }
    }, [enabled, totalChars]);
    useEffect(() => {
        if (!enabled || visibleChars >= totalChars) {
            setIsComplete(true);
            return;
        }

        const timer = setTimeout(() => {
            setVisibleChars((prev) => prev + 1);
        }, speed);

        return () => clearTimeout(timer);
    }, [visibleChars, totalChars, speed, enabled]);

    return { visibleChars, isComplete };
};
