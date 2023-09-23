import React, { useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

const ThemeColorUpdater: React.FC = () => {
  const { theme, userInfo } = useContext(UserContext);

  useEffect(() => {
    // Update the meta tag
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;

    //  update the meta tag only if it exists
    if (metaTag) {
      const themeColor = theme === "dark" ? "#0f172a" : "#f3f4f6";
      metaTag.setAttribute("content", themeColor);
    }
  }, [theme, userInfo]);

  return null;
};

export default ThemeColorUpdater;
