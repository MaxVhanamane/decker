import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UserContextProvider from "./context/UserContext";
import Layout from "./components/Layout";
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
import { SidebarContextProvider } from "./context/SidebarContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { networkMode: "offlineFirst" } },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AudioProvider>
    <ThemeContextProvider>
      <SidebarContextProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <StableNavigateContextProvider>
              <OfflineProvider>
                <UserContextProvider>
                  <SearchProvider>
                    <BulbContextProvider>
                      <ToastNotificationContextProvider>
                        <ToastContainer
                          globalAutoHideDuration={5000}
                          globalPosition="top-right"
                        />
                        <Layout>
                          <DeckContextProvider>
                            <CardContextProvider>
                              <DndContextProvider>
                                <App />
                              </DndContextProvider>
                            </CardContextProvider>
                          </DeckContextProvider>
                        </Layout>
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
      </SidebarContextProvider>
    </ThemeContextProvider>
  </AudioProvider>
);
