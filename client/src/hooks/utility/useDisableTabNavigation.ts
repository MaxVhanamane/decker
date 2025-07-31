import { useEffect } from "react";


export function useDisableTabNavigation(shouldDisable: boolean) {
    useEffect(() => {
        if (!shouldDisable) return;

        const handleKeyDown = (e: KeyboardEvent) => {

            if (e.key === "Tab") {
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [shouldDisable]);
}
