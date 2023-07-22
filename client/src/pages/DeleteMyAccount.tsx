import { useState, useEffect, useRef, RefObject } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useContext } from "react";
import { ChangeEvent } from "react";
import { request } from "./../utils/axios-utils";
import { UserContext } from "../context/UserContext";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";
import ReCAPTCHA from "react-google-recaptcha";
import { OfflineContext } from "../context/OfflineContext";

export default function DeleteMyAccount() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [showWaitMessage, setShowWaitMessage] = useState(false);
  const [showVerifyOTPButton, setShowVerifyOTPButton] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const recaptchaRef: RefObject<ReCAPTCHA> = useRef(null);
  const { userInfo, setUserInfo, theme } = useContext(UserContext);
  const { isOnline } = useContext(OfflineContext);
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
  const [captcha, setCaptcha] = useState(false);
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    let getUser = localStorage.getItem("userInfo");
    let userInformation;
    if (getUser) {
      userInformation = JSON.parse(getUser);
    }
    if (!userInformation?.email) {
      setUserInfo(null);
      localStorage.removeItem("userInfo");
      navigate("/login", { replace: true });
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    }
    if (e.target.name === "otp") {
      setOTP(e.target.value);
    }
  };

  const handleGetOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      return;
    }

    if (userInfo?.email === email) {
      setShowWaitMessage(true);
      const res = await request.post("/generateaccountdeletionotp", { email });
      if (res.data.success) {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "success",
          show: true,
          message: res.data.message,
          autoHideDuration: 5000,
        }));
        setShowVerifyOTPButton(true);
        setShowWaitMessage(false);
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: res.data.message,
          autoHideDuration: 6000,
        }));
        setShowWaitMessage(false);
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message:
          "The email you entered does not match with your Logged-in email. Please enter the correct email address to proceed",
        autoHideDuration: 6000,
      }));
      setShowWaitMessage(false);
    }
    // reset the captcha
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleOTPVerification = async () => {
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
    setIsDeletingAccount(true);

    if (otp.length === 6) {
      const res = await request.post("/verifyaccountdeletionotp", {
        email,
        otp,
      });
      if (res.data.success) {
        const res = await request.post("/deleteaccount", { email });
        if (res.data.success) {
          setUserInfo(null);
          localStorage.removeItem("userInfo");

          navigate("/accountdeletionsuccess", {
            replace: true,
            state: { accountDeletedSuccessfully: true },
          });
        }
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: res.data.message,
          autoHideDuration: 5000,
        }));
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "Invalid OTP. Please enter a 6-digit OTP to proceed.",
        autoHideDuration: 6000,
      }));
    }
    setIsDeletingAccount(false);
  };

  const handleCaptchaChange = () => {
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
    setCaptcha(true);
  };

  const handleCaptchaExpired = () => {
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
    setCaptcha(false);
  };

  return (
    <>
      <section className="absolute top-0 left-0 w-full h-full ">
        {localStorage.getItem("userInfo") != null ? (
          <div className=" py-12 px-2 h-full mx-3">
            <div className="flex justify-center items-center flex-wrap h-full  text-gray-800">
              <div className="w-full md:w-6/12">
                <div className="block   rounded-lg shadow-2xl bg-white dark:bg-[#0c1221] dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500">
                  <div className="flex justify-center items-center ">
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

                          <h2 className="font-bold text-2xl text-teal-600 dark:text-sky-500 ">
                            Decker
                          </h2>

                          {showVerifyOTPButton && (
                            <h4 className="text-md  mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50 text-justify">
                              Are you sure you want to delete your account? This
                              action is permanent and cannot be undone. All of
                              your decks and cards inside them will be deleted,
                              and you will no longer be able to access your
                              account.
                              <br /> To confirm your decision, please enter the
                              OTP we sent to your email address.
                            </h4>
                          )}

                          {!showVerifyOTPButton && (
                            <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">
                              Account Deletion Verification
                            </h4>
                          )}
                        </div>
                        <form onSubmit={handleGetOTP}>
                          {!showVerifyOTPButton ? (
                            <div className="mb-1">
                              <input
                                onChange={handleChange}
                                type="email"
                                className=" block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-[#0c1221] dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50 dark:focus:bg-[#0c1221]"
                                id="email"
                                name="email"
                                value={email}
                                placeholder="Email"
                                required
                              />
                            </div>
                          ) : null}
                          {!showVerifyOTPButton ? (
                            <div className="text-center pt-1 mb-5 pb-1 relative  ">
                              {isOnline ? (
                                <div className="w-[18.75rem] h-[4.625rem]">
                                  <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={
                                      import.meta.env.VITE_RECAPTCHA_SITE_KEY
                                    }
                                    onChange={handleCaptchaChange}
                                    onExpired={handleCaptchaExpired}
                                    size="normal"
                                    theme={theme === "dark" ? "dark" : "light"}
                                    className="mb-1"
                                  />
                                </div>
                              ) : (
                                <div className="dark:text-gray-400 text-gray-500 w-[18.75rem] h-[4.625rem]  flex items-center justify-center flex-col">
                                  <p>Couldn't load ReCAPTCHA because</p>
                                  <p> you have no internet connection.</p>
                                </div>
                              )}
                              <button
                                className={` mt-3 flex items-center justify-center px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-2 bg-teal-600 hover:bg-teal-700 dark:bg-sky-600 dark:hover:bg-sky-700 outline-none  disabled:cursor-not-allowed ${
                                  !showWaitMessage
                                    ? "dark:disabled:bg-gray-500 disabled:bg-gray-500"
                                    : ""
                                }`}
                                type="submit"
                                aria-label="Request OTP"
                                disabled={
                                  !captcha || showWaitMessage ? true : false
                                }
                              >
                                {showWaitMessage ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-100"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  "Request OTP"
                                )}
                              </button>
                              <button
                                className="  inline-block px-6 py-2.5 text-gray-50 font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3  bg-red-600 hover:bg-red-700  outline-none  disabled:cursor-not-allowed"
                                type="button"
                                aria-label="Cancel"
                                onClick={() => {
                                  navigate(from);
                                }}
                                disabled={showWaitMessage}
                              >
                                Cancel
                              </button>
                              {showWaitMessage ? (
                                <div className="absolute w-full flex items-center justify-center">
                                  <p className=" text-sm  text-center text-sky-700 dark:text-sky-400 font-semibold ">
                                    Sending OTP please wait...
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          {showVerifyOTPButton ? (
                            <div className="mb-4 flex items-center justify-center">
                              <input
                                onChange={handleChange}
                                type="text"
                                className=" block md:w-1/2 w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-[#0c1221] dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                                id="otp"
                                name="otp"
                                value={otp}
                                placeholder="Enter OTP"
                                maxLength={6}
                              />
                            </div>
                          ) : null}
                        </form>
                        {showVerifyOTPButton ? (
                          <div className="text-center pt-1 mb-10 pb-1 flex flex-col items-center justify-center">
                            <button
                              onClick={handleOTPVerification}
                              className="md:w-1/2 w-full  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out  mb-3 bg-teal-600 hover:bg-teal-700 dark:bg-sky-600 dark:hover:bg-sky-700 outline-none  disabled:cursor-not-allowed"
                              type="button"
                              aria-label="Verify OTP and Delete My Account"
                              disabled={isDeletingAccount}
                            >
                              {isDeletingAccount
                                ? "Account Deletion in Progress..."
                                : "Verify OTP and Delete My Account"}
                            </button>
                            <button
                              className=" md:w-1/2 w-full inline-block px-6 py-2.5 text-gray-50 font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out  mb-3   bg-red-600 hover:bg-red-700  outline-none  disabled:cursor-not-allowed"
                              disabled={isDeletingAccount}
                              type="button"
                              aria-label="Cancel"
                              onClick={() => {
                                navigate(from);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : null}
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
