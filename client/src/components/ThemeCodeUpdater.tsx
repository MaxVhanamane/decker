import React, { useEffect, useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";

const ThemeColorUpdater: React.FC = () => {
  const { theme } = useContext(UserContext);

  const themeColor = useMemo(
    () => (theme === "dark" ? "#1e293b" : "#f3f4f6"),
    [theme]
  );

  useEffect(() => {
    // Update the meta tag
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;

    //  update the meta tag only if it exists
    if (metaTag) {
      metaTag.setAttribute("content", themeColor);
    }
  }, [themeColor]);

  return null;
};

export default ThemeColorUpdater;
