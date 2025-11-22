import { useEffect } from "react";

function preventScroll(e: Event) {
    e.preventDefault();
}

export function useScrollLock(active: boolean) {
    useEffect(() => {
        if (active) {
            document.body.style.overflow = "hidden";
            document.addEventListener("wheel", preventScroll, { passive: false });
            document.addEventListener("touchmove", preventScroll, { passive: false });
        } else {
            document.body.style.overflow = "";
            document.removeEventListener("wheel", preventScroll);
            document.removeEventListener("touchmove", preventScroll);
        }
    }, [active]);
}
