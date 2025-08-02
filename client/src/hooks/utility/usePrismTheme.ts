import { useEffect } from "react";

export const usePrismTheme = (theme: "dark" | "light") => {
    useEffect(() => {
        const linkId = "prism-theme";
        let linkTag = document.getElementById(linkId) as HTMLLinkElement;

        if (!linkTag) {
            linkTag = document.createElement("link");
            linkTag.id = linkId;
            linkTag.rel = "stylesheet";
            document.head.appendChild(linkTag);
        }

        // Choose theme CSS file based on current theme
        linkTag.href =
            theme === "dark"
                ? "/themes/prism-dracula.css"
                : "/themes/prism-light.css";


    }, [theme]);
};
