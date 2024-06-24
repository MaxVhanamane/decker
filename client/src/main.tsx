import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UserContextProvider from "./context/UserContext";
import AlertState from "./context/AlertContext";
import Layout from "./components/Layout";
import ThemeColorUpdater from "./components/ThemeCodeUpdater";
import OfflineProvider from "./context/OfflineContext";
import SearchProvider from "./context/SearchContext";
import { AudioProvider } from "./context/AudioContext";
import { BulbContextProvider } from "./context/BulbContext";
import { CardContextProvider } from "./context/CardContext";
import { PopupContextProvider } from "./context/PopupContext";

const queryClient = new QueryClient({
  // Read more about the Network Mode in the React Query documentation.
  defaultOptions: { queries: { networkMode: "offlineFirst" } },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <AudioProvider>
      <AlertState>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <OfflineProvider>
              <UserContextProvider>
                <SearchProvider>
                  <ThemeColorUpdater />
                  <BulbContextProvider>
                    <PopupContextProvider>
                      <Layout>
                        <CardContextProvider>
                          <App />
                        </CardContextProvider>
                      </Layout>
                    </PopupContextProvider>
                  </BulbContextProvider>
                </SearchProvider>
              </UserContextProvider>
            </OfflineProvider>
          </BrowserRouter>

          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom"
            buttonPosition="bottom-left"
          />
        </QueryClientProvider>
      </AlertState>
    </AudioProvider>
  </>
);
