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
import { registerSW } from "virtual:pwa-register";
const queryClient = new QueryClient();

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/serviceWorker.js").catch((error) => {
//       console.log("Service worker registration failed:", error);
//     });
//   });
// }
// add this to prompt for a refresh
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
});
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <AlertState>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UserContextProvider>
            <ThemeColorUpdater />

            <Layout>
              <App />
            </Layout>
          </UserContextProvider>
        </BrowserRouter>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
    </AlertState>
  </>
);
