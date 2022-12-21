import ReactDOM from "react-dom/client";
import "./index.css"
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserContextProvider from "./context/context";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
    <UserContextProvider>

          <ToastContainer
            position="top-left"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            transition={Zoom}
            theme="light"
          />
          <App />
    </UserContextProvider>

        </BrowserRouter>

        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
  </>
);
