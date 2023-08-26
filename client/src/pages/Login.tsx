import { useState, ChangeEvent, useContext, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../utils/axios-utils";
import { FcGoogle } from "react-icons/fc";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";
import { Helmet } from "react-helmet";
import { OfflineContext } from "../context/OfflineContext";
import { UserContext } from "../context/UserContext";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const { isOnline } = useContext(OfflineContext);
  const { userInfo } = useContext(UserContext);

  // If a user clicks multiple times on the login button, multiple requests will be sent to the server. To avoid this, we will disable the button while the request is being processed.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else if (e.target.name === "password") {
      setPassword(e.target.value);
    }
  };
  useEffect(() => {
    if (userInfo?.email) {
      navigate("/");
    }
  }, [userInfo]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    setIsLoggingIn(true);

    try {
      const data = { email, password };

      const response = await request.post("/login", data);
      if (response.data.success == true) {
        navigate("/auth/success", { replace: true });
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: response.data.message,
          autoHideDuration: 5000,
        }));
      }
    } catch (error) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "An error occurred during login.",
        autoHideDuration: 5000,
      }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const userFromLocalStorage = localStorage.getItem("userInfo");
  let userInformation;
  if (userFromLocalStorage) {
    userInformation = JSON.parse(userFromLocalStorage);
  } else {
    userInformation = null;
  }
  const handleGoogleLogin = async () => {
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    window.open(`${import.meta.env.VITE_GOOGLE_AUTH_URL}`, "_self");
  };

  return (
    <>
      <Helmet>
        <title>Decker-Login</title>
      </Helmet>
      <section className="absolute top-0 left-0 w-full h-full bg-[#fcfefc] dark:bg-slate-950">
        {userInformation === null ? (
          <div className=" py-12 px-6 h-full">
            <div className="flex justify-center items-center flex-wrap h-full ">
              <div className="xl:w-6/12">
                <div className="block   rounded-lg shadow-2xl bg-[#fcfefc] dark:bg-slate-950 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500 ">
                  <div className="flex justify-center items-center g-0">
                    <div className=" px-4 md:px-0">
                      <div className="md:p-12 p-4 md:mx-6">
                        <div className="flex items-center justify-center flex-col rounded-full">
                          <img
                            src={`${
                              localStorage.getItem("theme") === "dark" ||
                              localStorage.getItem("theme") === null
                                ? "/decker_logo_dark.png"
                                : "/decker_logo_light.png"
                            }`}
                            className="w-7 h-7 object-contain"
                            alt="decker logo"
                          />
                          <h1 className="font-bold text-2xl text-teal-600 dark:text-sky-500 ">
                            Decker
                          </h1>
                          <h2 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">
                            Log in to your account
                          </h2>
                        </div>
                        <form onSubmit={handleLogin}>
                          {/* <p className="mb-4">Please login to your account</p> */}
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="email"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-400 dark:border-gray-300/40 rounded transition-[border-color] ease-in-out duration-150 m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-700 focus:outline-none dark:text-gray-50 dark:bg-slate-950 dark:focus:ring-gray-100/40 dark:focus:ring-1"
                              id="email"
                              placeholder="Email"
                              name="email"
                              required
                              autoComplete="username"
                            />
                          </div>
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="password"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-400 dark:border-gray-300/40 rounded transition-[border-color] duration-150 ease-in-out m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-700 focus:outline-none dark:text-gray-50 dark:bg-slate-950 dark:focus:ring-gray-100/40 dark:focus:ring-1"
                              id="password"
                              placeholder="Password"
                              name="password"
                              required
                              autoComplete="current-password"
                            />
                          </div>
                          <div className="text-center pt-1  pb-1">
                            <button
                              className="  inline-block px-6 py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-full   dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition duration-150 ease-in-out   disabled:cursor-not-allowed"
                              type="submit"
                              aria-label="Log in"
                              disabled={isLoggingIn}
                            >
                              {isLoggingIn ? "Logging in..." : "Log in"}
                            </button>
                            <div className="relative py-1">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-b border-gray-300 dark:border-gray-300/30"></div>
                              </div>
                              <div className="relative flex justify-center">
                                <span className="bg-[#fcfefc] px-4 text-sm text-gray-500 dark:bg-slate-950">
                                  or
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleGoogleLogin()}
                              className="  px-6 py-[0.35rem] text-gray-800 font-medium text-sm leading-tight  rounded   active:shadow-lg transition-[border-color] duration-150 ease-in-out w-full mb-3 flex items-center justify-center dark:text-gray-50 gap-4 border border-gray-500 dark:border-gray-100/80 hover:border hover:border-teal-500 dark:hover:border-sky-500"
                              type="button"
                              aria-label="Continue with Google"
                            >
                              <span>
                                <FcGoogle className="text-2xl" />
                              </span>{" "}
                              <span> Continue with Google</span>
                            </button>

                            <Link
                              to="/forgotpassword"
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-50 dark:hover:text-gray-200"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <div className="flex items-center justify-center gap-2 pb-6">
                            <p className=" text-gray-800 dark:text-gray-50">
                              Don&apos;t have an account?
                            </p>
                            <Link to="/verifyemail">
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
        ) : null}
      </section>
    </>
  );
}
