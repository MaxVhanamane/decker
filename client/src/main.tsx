import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UserContextProvider from "./context/UserContext";
import Layout from "./components/Layout";
import ThemeColorUpdater from "./components/ThemeCodeUpdater";
import OfflineProvider from "./context/OfflineContext";
import SearchProvider from "./context/SearchContext";
import { AudioProvider } from "./context/AudioContext";
import { BulbContextProvider } from "./context/BulbContext";
import { CardContextProvider } from "./context/CardContext";
import { ToastNotificationContextProvider } from "./context/ToastNotificationContext";
import ThemeContextProvider from "./context/ThemeContext";
import DndContextProvider from "./context/DndItemContext";
import ToastContainer from "./components/toast/ToastContainer";
import { DeckContextProvider } from "./context/DeckContext";
import { StableNavigateContextProvider } from "./context/StableNavigateContext";

const queryClient = new QueryClient({
  // Read more about the Network Mode in the React Query documentation.
  defaultOptions: { queries: { networkMode: "offlineFirst" } },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AudioProvider>
    <ThemeContextProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StableNavigateContextProvider>
            <OfflineProvider>
              <UserContextProvider>
                <SearchProvider>
                  <ThemeColorUpdater />
                  <BulbContextProvider>
                    <ToastNotificationContextProvider>
                      <Layout>
                        <DeckContextProvider>
                          <CardContextProvider>
                            <DndContextProvider>
                              <App />
                            </DndContextProvider>
                          </CardContextProvider>
                        </DeckContextProvider>
                      </Layout>
                      <ToastContainer
                        globalAutoHideDuration={5000}
                        globalPosition="top-right"
                      />
                    </ToastNotificationContextProvider>
                  </BulbContextProvider>
                </SearchProvider>
              </UserContextProvider>
            </OfflineProvider>
          </StableNavigateContextProvider>
        </BrowserRouter>

        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </ThemeContextProvider>
  </AudioProvider>
);
