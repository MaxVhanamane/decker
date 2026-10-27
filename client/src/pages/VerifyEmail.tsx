import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useContext } from "react";
import { ChangeEvent } from "react";
import { request } from "../utils/fetch-utils";
import { OfflineContext } from "../context/OfflineContext";
import { CustomError } from "../utils/customError";
import { ShowToastContext } from "../context/ToastNotificationContext";
export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [showWaitMessage, setShowWaitMessage] = useState(false);
  const [showVerifyOTPButton, setShowVerifyOTPButton] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useContext(ShowToastContext);
  const { isOnline } = useContext(OfflineContext);

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
    setShowWaitMessage(true);
    try {
      const res = await request.post("/api/v1/otp/generate", { email });
      if (res?.data?.success) {
        showToast({
          message: res.data.message,
          severity: "success",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });

        setShowVerifyOTPButton(true);
        setShowWaitMessage(false);
      } else {
        showToast({
          message: res.data.message,
          severity: "error",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });

        setShowWaitMessage(false);
      }
    } catch (error) {
      showToast({
        message:
          (error as CustomError)?.message ||
          "Oops! Something went wrong. Please try again.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      setShowWaitMessage(false);
    }
  };

  const handleOTPVerification = async (e: FormEvent<HTMLFormElement>) => {
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
    setIsVerifyingOTP(true);
    if (otp.length === 6) {
      try {
        const res = await request.post("/api/v1/otp/verify", { email, otp });
        if (res.data.success) {
          showToast({
            message: res.data.message,
            severity: "success",
            autoHideDuration: 5000,
            position: "top-center",
            animationStyle: "scale-up",
            theme: "auto",
          });
          navigate(`/signup?email=${email}&otp=${otp}`);
        } else {
          showToast({
            message: res.data.message,
            severity: "error",
            autoHideDuration: 5000,
            position: "top-center",
            animationStyle: "scale-up",
            theme: "auto",
          });

          if (
            res.data.message ===
            "Your OTP has expired! Please request a new one to continue."
          ) {
            setOTP("");
            setShowVerifyOTPButton(false);
          }
        }
      } catch (error) {
        showToast({
          message:
            (error as CustomError)?.message ||
            "Uh-oh! Something went wrong while verifying the OTP.",
          severity: "error",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });
        setIsVerifyingOTP(false);
      }
    } else {
      showToast({
        message: "Invalid OTP. Please enter a 6-digit OTP to proceed.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    }
    setIsVerifyingOTP(false);
  };

  return (
    <>
      <section className="absolute top-0 left-0 w-full h-full">
        <div className=" py-12 px-6 h-full">
          <div className="flex justify-center items-center flex-wrap h-full text-gray-800">
            <div className="xl:w-6/12">
              <div className="block   rounded-lg shadow-lg border-2 border-sky-500 bg-white dark:bg-slate-900 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500">
                <div className="flex justify-center items-center g-0">
                  <div className=" px-4 md:px-0">
                    <div className="md:p-12 p-4 md:mx-6">
                      <div className="flex items-center justify-center flex-col rounded-full">
                        <img
                          src="/decker_logo.png"
                          className="w-7 h-7 object-contain"
                          alt="decker logo"
                        />

                        <h2 className="font-bold text-2xl text-sky-500 ">
                          Decker
                        </h2>

                        <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">{`${
                          showVerifyOTPButton
                            ? "Verify OTP"
                            : " Verify email address"
                        } `}</h4>
                      </div>
                      {!showVerifyOTPButton && (
                        <form onSubmit={handleGetOTP}>
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="email"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50 dark:focus:dark:bg-slate-900"
                              id="email"
                              name="email"
                              value={email}
                              placeholder="Email"
                              required
                            />
                          </div>

                          <div className="text-center pt-1 mb-5 pb-1 relative">
                            <button
                              className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-200  w-full mb-3 bg-sky-600 hover:bg-sky-700 outline-none disabled:cursor-not-allowed"
                              type="submit"
                              aria-label="Request OTP"
                              disabled={showWaitMessage}
                            >
                              Request OTP
                            </button>
                            {showWaitMessage ? (
                              <div className="absolute w-full flex items-center justify-center">
                                <p className=" text-sm  text-center text-sky-700 dark:text-sky-400 font-semibold ">
                                  Sending OTP please wait...
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </form>
                      )}
                      {showVerifyOTPButton && (
                        <form onSubmit={handleOTPVerification}>
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="text"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                              id="otp"
                              name="otp"
                              value={otp}
                              placeholder="Enter OTP"
                              maxLength={6}
                            />
                          </div>

                          <div className="text-center pt-1 mb-4 pb-1">
                            <button
                              className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-sky-600 hover:bg-sky-700 outline-none disabled:cursor-not-allowed"
                              type="submit"
                              aria-label="Verify OTP"
                              disabled={isVerifyingOTP}
                            >
                              {isVerifyingOTP
                                ? "Verifying OTP..."
                                : "Verify OTP"}
                            </button>
                          </div>
                        </form>
                      )}
                      <div className="flex items-center justify-between pb-6">
                        <p className="text-gray-800 dark:text-gray-50 mr-2">
                          Have an account?
                        </p>
                        <Link to="/login">
                          <button
                            type="button"
                            className="inline-block px-6 py-2 border-2 border-sky-500 text-sky-500 font-medium text-sm leading-tight  rounded   hover:text-sky-600 hover:border-sky-600 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                            aria-label="Login"
                          >
                            Login
                          </button>
                        </Link>
                      </div>
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
