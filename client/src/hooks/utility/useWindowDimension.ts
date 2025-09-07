import { useEffect, useState } from 'react'
import debounce from "lodash/debounce";

const useWindowDimension = () => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const debouncedResize = debounce(() => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }, 300);
        window.addEventListener("resize", debouncedResize);
        return () => window.removeEventListener("resize", debouncedResize);
    }, []);

    return windowDimensions
}

export default useWindowDimension
