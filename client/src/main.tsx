import ReactDOM from "react-dom/client";
import "./index.css"
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import UserContextProvider from "./context/UserContext";
import AlertState from "./context/AlertState";
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
  <AlertState>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
    <UserContextProvider>

          <App />
    </UserContextProvider>

        </BrowserRouter>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
      </AlertState>
  </>
);
