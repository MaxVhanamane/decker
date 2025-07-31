import { lazy, memo, Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { Route, Routes } from "react-router-dom";
import Loading from "./Loading";
import CheckAuth from "./CheckAuth";
import Login from "../pages/Login";
import AuthSuccess from "../pages/AuthSuccess";
import Deck from "../pages/Deck";
import PrivateRoutes from "./PrivateRoutes";

// Lazy load the components
const AuthFailure = lazy(() => import("../pages/AuthFailure"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const SessionExpired = lazy(() => import("../pages/SessionExpired"));
const DeleteMyAccount = lazy(() => import("../pages/DeleteMyAccount"));
const SignUp = lazy(() => import("../pages/Signup"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const Cards = lazy(() => import("../pages/Cards"));

const AccountDeletionSuccess = lazy(
  () => import("../pages/AccountDeletionSuccess")
);
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

const MemoizedRoutes = memo(() => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Deck />} />
          <Route
            path="/cards/:deckId"
            element={
              <Suspense fallback={<Loading />}>
                <Cards />
              </Suspense>
            }
          />

          <Route
            path="/account/deletemyaccount"
            element={
              <Suspense fallback={<Loading />}>
                <DeleteMyAccount />
              </Suspense>
            }
          />
        </Route>
        {/*Added the <CheckAuth /> component to prevent flickering when a user visits these pages while logged in. */}
        <Route element={<CheckAuth />}>
          <Route
            path="/signup"
            element={
              <Suspense fallback={<Loading />}>
                <SignUp />
              </Suspense>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/sessionexpired"
            element={
              <Suspense fallback={<Loading />}>
                <SessionExpired />
              </Suspense>
            }
          />
          <Route
            path="/forgotpassword"
            element={
              <Suspense fallback={<Loading />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/changepassword"
            element={
              <Suspense fallback={<Loading />}>
                <ChangePassword />
              </Suspense>
            }
          />

          <Route
            path="/verifyemail"
            element={
              <Suspense fallback={<Loading />}>
                <VerifyEmail />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/auth/failure"
          element={
            <Suspense fallback={<Loading />}>
              <AuthFailure />
            </Suspense>
          }
        />
        <Route
          path="/accountdeletionsuccess"
          element={
            <Suspense fallback={<Loading />}>
              <AccountDeletionSuccess />
            </Suspense>
          }
        />

        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<Loading />}>
              <PageNotFound />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
});

export default MemoizedRoutes;
