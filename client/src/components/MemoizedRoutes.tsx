import { lazy, memo, Suspense, useEffect } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { Route, Routes } from "react-router-dom";
import CheckAuth from "./CheckAuth";
import Login from "../pages/Login";
import AuthSuccess from "../pages/AuthSuccess";
import Deck from "../pages/Deck";
import PrivateRoutes from "./PrivateRoutes";
import LoadingCentered from "./Loading/LoadingCentered";
import lazyWithPreload from "./LazyWithPreload";

// Lazy load the components
const AuthFailure = lazy(() => import("../pages/AuthFailure"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const SessionExpired = lazy(() => import("../pages/SessionExpired"));
const DeleteMyAccount = lazy(() => import("../pages/DeleteMyAccount"));
const SignUp = lazy(() => import("../pages/Signup"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const Cards = lazyWithPreload(() => import("../pages/Cards"));

const AccountDeletionSuccess = lazy(
  () => import("../pages/AccountDeletionSuccess")
);
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

const MemoizedRoutes = memo(() => {
  useEffect(() => {
    setTimeout(() => {
      Cards.preload();
    }, 10000);
  }, []);
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Deck />} />
          <Route
            path="/cards/:deckId"
            element={
              <Suspense
                fallback={
                  <LoadingCentered message="Just a moment while we bring your cards…" />
                }
              >
                <Cards mode="deck" />
              </Suspense>
            }
          />
          <Route
            path="/cards/:deckId/:chapterId"
            element={
              <Suspense
                fallback={
                  <LoadingCentered message="Just a moment while we bring your cards…" />
                }
              >
                <Cards mode="chapter" />
              </Suspense>
            }
          />

          <Route
            path="/account/deletemyaccount"
            element={
              <Suspense fallback={<LoadingCentered />}>
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
              <Suspense fallback={<LoadingCentered />}>
                <SignUp />
              </Suspense>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/sessionexpired"
            element={
              <Suspense fallback={<LoadingCentered />}>
                <SessionExpired />
              </Suspense>
            }
          />
          <Route
            path="/forgotpassword"
            element={
              <Suspense fallback={<LoadingCentered />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/changepassword"
            element={
              <Suspense fallback={<LoadingCentered />}>
                <ChangePassword />
              </Suspense>
            }
          />

          <Route
            path="/verifyemail"
            element={
              <Suspense fallback={<LoadingCentered />}>
                <VerifyEmail />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/auth/failure"
          element={
            <Suspense fallback={<LoadingCentered />}>
              <AuthFailure />
            </Suspense>
          }
        />
        <Route
          path="/accountdeletionsuccess"
          element={
            <Suspense fallback={<LoadingCentered />}>
              <AccountDeletionSuccess />
            </Suspense>
          }
        />

        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingCentered />}>
              <PageNotFound />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
});

export default MemoizedRoutes;
