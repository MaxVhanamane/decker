import { useState, ChangeEvent, useContext, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../utils/fetch-utils";
import { FcGoogle } from "react-icons/fc";
import { Helmet } from "react-helmet";
import { OfflineContext } from "../context/OfflineContext";
import { CustomError } from "../utils/customError";
import { ShowToastContext } from "../context/ToastNotificationContext";
import { UserContext } from "../context/UserContext";
import { UserStore } from "../utils/userStore";
import Button from "../components/Button";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export default function Login() {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const { showToast } = useContext(ShowToastContext);
  const navigate = useNavigate();
  const { isOnline } = useContext(OfflineContext);
  const { setUserInfo } = useContext(UserContext);

  // If a user clicks multiple times on the login button, multiple requests will be sent to the server. To avoid this, we will disable the button while the request is being processed.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      showToast({
        message: "No internet connection",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return;
    }
    setIsLoggingIn(true);

    if (password.length < 8) {
      showToast({
        message: "Password must be at least 8 characters long.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      setIsLoggingIn(false);
      return;
    }

    try {
      const data = { email, password };
      const response = await request.post("/login", data);
      if (response.data.success == true) {
        setUserInfo(response.data.userInfo);
        UserStore.saveUser({
          profile_picture_url: response?.data?.userInfo?.profile_picture_url,
          username: response?.data?.userInfo?.profile_picture_url,
        });

        navigate("/auth/success", { replace: true });
      }
    } catch (error) {
      showToast({
        message: (error as CustomError)?.message
          ? (error as CustomError)?.message
          : "An error occurred during the login process",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isOnline) {
      showToast({
        message: "No internet connection",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return;
    }
    // window.open(`${import.meta.env.VITE_GOOGLE_AUTH_URL}`, "_self");
    window.location.replace(`${import.meta.env.VITE_GOOGLE_AUTH_URL}#auth`);
  };

  return (
    <>
      <Helmet>
        <title>Decker-Login</title>
      </Helmet>
      <section className="absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-900">
        <div className=" py-12 px-6 h-full">
          <div className="flex justify-center items-center flex-wrap h-full ">
            <div className="xl:w-6/12">
              <div className="block rounded-lg shadow-lg bg-white border-2 border-sky-500 dark:bg-slate-900 dark:border dark:shadow-sm dark:shadow-sky-500 dark:border-sky-500 ">
                <div className="flex justify-center items-center g-0">
                  <div className=" px-4 md:px-0">
                    <div className="md:p-12 p-4 md:mx-6">
                      <div className="flex items-center justify-center flex-col rounded-full">
                        <img
                          src="/decker_logo.png"
                          className="w-7 h-7 object-contain"
                          alt="decker logo"
                        />
                        <h1 className="font-bold text-2xl text-sky-500 ">
                          Decker
                        </h1>
                        <h2 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">
                          Log in to your account
                        </h2>
                      </div>
                      <form onSubmit={handleLogin}>
                        <div className="mb-4">
                          <input
                            onChange={handleChange}
                            type="email"
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-400 dark:border-gray-300/40 rounded transition-[border-color] ease-in-out duration-150 m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-700 focus:outline-none dark:text-gray-50 dark:bg-slate-900 dark:focus:ring-slate-400 focus:ring-gray-400 focus:ring-1"
                            id="email"
                            placeholder="Email"
                            name="email"
                            required
                            autoComplete="email"
                          />
                        </div>
                        <div className="mb-4 relative">
                          <input
                            onChange={handleChange}
                            type={showPassword ? "text" : "password"}
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-400 dark:border-gray-300/40 rounded transition-[border-color] duration-150 ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-700 focus:outline-none dark:text-gray-50 dark:bg-slate-900 dark:focus:ring-slate-400 focus:ring-gray-400 focus:ring-1 pr-8"
                            id="password"
                            placeholder="Password"
                            name="password"
                            required
                            autoComplete="current-password"
                          />
                          <Button
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            variant="unstyled"
                            className="absolute right-1 top-1/2 -translate-y-1/2 dark:text-gray-300 text-gray-700 p-1 rounded focus-visible:ring-1 dark:focus-visible:ring-slate-400 focus-visible:ring-gray-400"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <AiOutlineEye className="text-lg dark:text-slate-400 text-gray-500" />
                            ) : (
                              <AiOutlineEyeInvisible className="text-lg dark:text-slate-400 text-gray-500" />
                            )}
                          </Button>
                        </div>
                        <div className="text-center pt-1  pb-1">
                          <Button
                            variant="unstyled"
                            className="inline-block px-6 py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50 dark:focus-visible:ring-slate-300 w-full bg-sky-600 hover:bg-sky-700 transition duration-200  disabled:cursor-not-allowed"
                            type="submit"
                            aria-label="Log in"
                            disabled={isLoggingIn}
                          >
                            {isLoggingIn ? "Logging in..." : "Log in"}
                          </Button>
                          <div className="relative py-1">
                            <div className="flex items-center">
                              <div className="flex-grow border-t border-gray-300 dark:border-gray-300/30"></div>
                              <div className="mx-2 dark:text-gray-400 text-gray-500">
                                or
                              </div>
                              <div className="flex-grow border-t border-gray-300 dark:border-gray-300/30"></div>
                            </div>
                          </div>
                          <Button
                            variant="unstyled"
                            onClick={() => handleGoogleLogin()}
                            className="  px-6 py-[0.35rem] text-gray-800 font-medium text-sm leading-tight  rounded  transition-[border-color] duration-150 ease-in-out w-full mb-3 flex items-center justify-center dark:text-gray-50 gap-4 border border-gray-500 dark:focus-visible:ring-slate-300 dark:border-gray-100/80 hover:border hover:border-sky-500"
                            type="button"
                            aria-label="Continue with Google"
                          >
                            <span>
                              <FcGoogle className="text-2xl" />
                            </span>{" "}
                            <span> Continue with Google</span>
                          </Button>

                          <Link
                            to="/forgotpassword"
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-200 dark:focus-visible:ring-slate-400 focus-visible:ring-1 focus-visible:ring-gray-400 outline-none rounded px-2 py-1"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="flex items-center justify-center gap-2 pb-6">
                          <p className=" text-gray-800 dark:text-gray-50">
                            Don&apos;t have an account?
                          </p>
                          <Link
                            to="/verifyemail"
                            className="dark:focus-visible:ring-slate-400 focus-visible:ring-gray-400 focus-visible:ring-1 outline-none rounded p-1"
                          >
                            <p className="  text-blue-600 hover:text-blue-700 font-medium text-sm  dark:text-sky-500 dark:hover:text-sky-600 ">
                              Sign Up
                            </p>
                          </Link>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
