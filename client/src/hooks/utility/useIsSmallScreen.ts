import { useEffect, useState } from "react";


export const useIsSmallScreen = () => {

    const [isSmallScreen, setIsSmallScreen] = useState(
        () => window.innerWidth < 640
    );
    useEffect(() => {
        const checkScreen = () => setIsSmallScreen(window.innerWidth < 640);
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    return isSmallScreen
}
