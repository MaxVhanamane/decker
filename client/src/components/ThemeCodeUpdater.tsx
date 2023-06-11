import React, { useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";

const ThemeColorUpdater: React.FC = () => {
  const { theme } = useContext(UserContext);
  useEffect(() => {
    const themeColor = theme === "dark" ? "#1e293b" : "#f3f4f6";

    // Update the meta tag
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;
    if (metaTag) {
      metaTag.setAttribute("content", themeColor);
    }
  }, [theme]);

  return null;
};

export default ThemeColorUpdater;
