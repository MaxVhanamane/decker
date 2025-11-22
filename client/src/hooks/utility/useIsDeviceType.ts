import { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { largePhoneDimension } from "../../utils/constants";


const breakpoints = {
    phone: 640,              // < 640px → small phones
    largePhone: largePhoneDimension, // 640–767px → large phones / phablets
    tablet: 1280,            // < 1280px → tablets and smaller
};

type Breakpoint = keyof typeof breakpoints;

export const useIsDeviceType = (breakpoint: Breakpoint) => {
    const bp = breakpoints[breakpoint];

    const getMatch = () => {
        if (typeof bp === "number") {
            // For simple "below" breakpoints like phone or tablet
            return window.innerWidth < bp;
        } else {
            // For range-based breakpoints like largePhone
            return window.innerWidth >= bp.min && window.innerWidth <= bp.max;
        }
    };

    const [matches, setMatches] = useState(getMatch);

    useEffect(() => {
        const check = debounce(() => {
            setMatches(getMatch());
        }, 200);

        window.addEventListener("resize", check);
        check(); // run immediately on mount

        return () => {
            window.removeEventListener("resize", check);
            check.cancel();
        };
    }, [bp]);

    return matches;
};
