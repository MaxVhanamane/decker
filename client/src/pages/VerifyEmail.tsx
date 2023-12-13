import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useContext } from "react";
import { ChangeEvent } from "react";
import { request } from "../utils/fetch-utils";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";
import { OfflineContext } from "../context/OfflineContext";
export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [showWaitMessage, setShowWaitMessage] = useState(false);
  const [showVerifyOTPButton, setShowVerifyOTPButton] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);
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
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    setShowWaitMessage(true);
    const res = await request.post("/generateotp", { email });
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
    setIsVerifyingOTP(true);
    if (otp.length === 6) {
      const res = await request.post("/verifyotp", { email, otp });
      if (res.data.success) {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "success",
          show: true,
          message: res.data.message,
        }));
        navigate(`/signup?email=${email}&otp=${otp}`);
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: res.data.message,
        }));

        if (
          res.data.message ===
          "Your OTP has expired! Please request a new one to continue."
        ) {
          setOTP("");
          setShowVerifyOTPButton(false);
        }
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "Invalid OTP. Please enter a 6-digit OTP to proceed.",
      }));
    }
    setIsVerifyingOTP(false);
  };

  return (
    <>
      <section className="absolute top-0 left-0 w-full h-full">
        <div className=" py-12 px-6 h-full">
          <div className="flex justify-center items-center flex-wrap h-full text-gray-800">
            <div className="xl:w-6/12">
              <div className="block   rounded-lg shadow-2xl bg-[#fcfefc] dark:bg-slate-900 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500">
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

                        <h2 className="font-bold text-2xl text-teal-600 dark:text-sky-500 ">
                          Decker
                        </h2>

                        <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">{`${
                          showVerifyOTPButton
                            ? "Verify OTP"
                            : " Verify email address"
                        } `}</h4>
                      </div>
                      <form onSubmit={handleGetOTP}>
                        {!showVerifyOTPButton ? (
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="email"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50 dark:focus:dark:bg-slate-900"
                              id="email"
                              name="email"
                              value={email}
                              placeholder="Email"
                              required
                            />
                          </div>
                        ) : null}

                        {!showVerifyOTPButton ? (
                          <div className="text-center pt-1 mb-5 pb-1 relative">
                            <button
                              className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-teal-600 hover:bg-teal-700 dark:bg-sky-600 dark:hover:bg-sky-700 outline-none disabled:cursor-not-allowed"
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
                        ) : null}
                        {showVerifyOTPButton ? (
                          <div className="mb-4">
                            <input
                              onChange={handleChange}
                              type="text"
                              className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
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
                        <div className="text-center pt-1 mb-4 pb-1">
                          <button
                            onClick={handleOTPVerification}
                            className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-teal-600 hover:bg-teal-700 dark:bg-sky-600 dark:hover:bg-sky-700 outline-none disabled:cursor-not-allowed"
                            type="button"
                            aria-label="Verify OTP"
                            disabled={isVerifyingOTP}
                          >
                            Verify OTP
                          </button>
                        </div>
                      ) : null}
                      <div className="flex items-center justify-between pb-6">
                        <p className="text-gray-800 dark:text-gray-50 mr-2">
                          Have an account?
                        </p>
                        <Link to="/login">
                          <button
                            type="button"
                            className="inline-block px-6 py-2 border-2 border-teal-600 text-teal-700 dark:border-sky-500 dark:text-sky-500 font-medium text-sm leading-tight  rounded hover:border-teal-500 hover:text-teal-600 dark:hover:text-sky-600 dark:hover:border-sky-400 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
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
