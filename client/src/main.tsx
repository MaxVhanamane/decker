import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import UserContextProvider from "./context/UserContext";
import AlertState from "./context/AlertContext";
import Layout from "./components/Layout";
import ThemeColorUpdater from "./components/ThemeCodeUpdater";
import OfflineProvider from "./context/OfflineContext";
import SearchProvider from "./context/SearchContext";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <AlertState>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineProvider>
            <UserContextProvider>
              <SearchProvider>
                <ThemeColorUpdater />

                <Layout>
                  <App />
                </Layout>
              </SearchProvider>
            </UserContextProvider>
          </OfflineProvider>
        </BrowserRouter>

        {/* <ReactQueryDevtools initialIsOpen={false} position="bottom-left" /> */}
      </QueryClientProvider>
    </AlertState>
  </>
);
