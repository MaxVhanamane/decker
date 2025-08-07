import { useEffect, useState } from "react";
import debounce from "lodash/debounce";

const breakpoints = {
    phone: 640,
    tablet: 1024,
};

type Breakpoint = keyof typeof breakpoints;

export const useIsDeviceType = (breakpoint: Breakpoint) => {
    const breakpointValue = breakpoints[breakpoint];

    const [isBelow, setIsBelow] = useState(() => window.innerWidth < breakpointValue);

    useEffect(() => {
        const check = debounce(() => {
            setIsBelow(window.innerWidth < breakpointValue);
        }, 200);

        window.addEventListener("resize", check);
        check();

        return () => {
            window.removeEventListener("resize", check);
            check.cancel(); // Cancel any pending debounced calls
        };
    }, [breakpointValue]);

    return isBelow;
};
