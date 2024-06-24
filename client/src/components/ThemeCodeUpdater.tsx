import React, { useEffect, useContext } from "react";
import { ThemeContext, UserContext } from "../context/UserContext";

const ThemeColorUpdater: React.FC = () => {
  const { userInfo } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // Update the meta tag
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;

    //  update the meta tag only if it exists
    if (metaTag) {
      const themeColor = theme === "dark" ? "#0f172a" : "#fcfefc";
      metaTag.setAttribute("content", themeColor);
    }
  }, [theme, userInfo]);

  return null;
};

export default ThemeColorUpdater;
