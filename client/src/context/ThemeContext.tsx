import {
  createContext,
  Dispatch,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

interface ThemeContextType {
  theme: "dark" | "light";

  setTheme: Dispatch<React.SetStateAction<"dark" | "light">>;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      localStorage.getItem("theme") === null
    ) {
      return "dark";
    } else return "light";
  });

  // give default theme as dark
  useEffect(() => {
    const userThemePreference = localStorage.getItem("theme");

    if (userThemePreference === "dark" || userThemePreference === "light") {
      // User has already selected a theme, use their preference
      setTheme(userThemePreference);
    } else {
      // No user preference found, default to dark theme
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const isDarkMode = theme === "dark";

    // Disable transitions temporarily
    root.classList.add("disable-transition");
    // Set background color based on theme
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    root.style.backgroundColor = bgColor;
    // Update meta theme-color. it changes status bar color on mobile devices
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;
    if (metaTag) metaTag.setAttribute("content", bgColor);
    // Toggle dark mode class
    root.classList.toggle("dark", isDarkMode);

    const frameId = requestAnimationFrame(() => {
      root.classList.remove("disable-transition");
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [theme]);

  //If the user changes the theme preference directly from localStorage or tampers with the userInfo, we will listen for that change and take appropriate action accordingly.

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") {
        const newTheme = event.newValue;
        // Check if the new theme value is not null and is one of the allowed themes
        if ((newTheme && newTheme === "dark") || newTheme === "light") {
          setTheme(newTheme);
        } else {
          // Fallback to a default theme:
          setTheme("dark");
          // Reset the theme value in localStorage to the default dark theme
          localStorage.setItem("theme", "dark");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const themeContextValue = useMemo(() => {
    return { theme, setTheme };
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
