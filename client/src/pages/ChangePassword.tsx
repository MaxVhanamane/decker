import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useContext } from "react";
import { ChangeEvent } from "react";
import { request } from "../utils/fetch-utils";
import { UserContext } from "../context/UserContext";
import { OfflineContext } from "../context/OfflineContext";
import { CustomError } from "../utils/customError";
import { ShowToastContext } from "../context/ToastNotificationContext";

export default function ChangePassword() {
  const location = useLocation();
  // Parse the query string using the URLSearchParams API
  const searchParams = new URLSearchParams(location.search);
  const { showToast } = useContext(ShowToastContext);
  // Get the value of a parameter
  const emailAddress = searchParams.get("email");
  const otp = searchParams.get("otp");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const { userEmailAddress } = useContext(UserContext);
  const navigate = useNavigate();
  const { isOnline } = useContext(OfflineContext);

  useEffect(() => {
    if (userEmailAddress || !emailAddress || !otp) {
      navigate("/");
    }
  }, [userEmailAddress]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "password") {
      setPassword(e.target.value);
    } else if (e.target.name === "confirmPass") {
      setConfirmPass(e.target.value);
    }
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
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

    if (password === confirmPass) {
      if (password.length > 7 && confirmPass.length > 7) {
        const data = { email: emailAddress, otp: otp, newPassword: password };
        try {
          const res = await request.post("/api/v1/password/change", data);
          if (res.data.success) {
            showToast({
              message: res.data.message,
              severity: "success",
              autoHideDuration: 5000,
              position: "top-center",
              animationStyle: "scale-up",
              theme: "auto",
            });
            setConfirmPass("");
            setPassword("");
            navigate("/login");
          }
        } catch (error) {
          showToast({
            message: (error as CustomError)?.message
              ? (error as CustomError)?.message
              : "Something went wrong please try again later!",
            severity: "error",
            autoHideDuration: 5000,
            position: "top-center",
            animationStyle: "scale-up",
            theme: "auto",
          });
        }
      } else {
        showToast({
          message: "password must be at least 8 characters long",
          severity: "error",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });
      }
    } else {
      showToast({
        message: "Password and confirm password didn't match",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    }
  };
  return (
    <>
      <section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        <div className="  px-6 h-full">
          <div className="flex justify-center items-center flex-wrap h-full  text-gray-800 pt-[3.45rem]">
            <div className="xl:w-6/12">
              <div className="block bg-white shadow-lg rounded-lg dark:bg-slate-900 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500">
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

                        <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">
                          Change Password
                        </h4>
                      </div>
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                          <input
                            onChange={handleChange}
                            type="password"
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="New password"
                            required
                            autoComplete="off"
                          />
                        </div>
                        <div className="mb-4">
                          <input
                            onChange={handleChange}
                            type="password"
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-900 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                            id="confirmpassword"
                            name="confirmPass"
                            value={confirmPass}
                            placeholder="Confirm new password"
                            required
                            autoComplete="off"
                          />
                        </div>
                        <div className="text-center pt-1 mb-5 pb-1">
                          <button
                            className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-sky-600 hover:bg-sky-700 outline-none"
                            type="submit"
                            aria-label="Change Password"
                          >
                            Change Password
                          </button>
                        </div>
                        <div className="flex items-center justify-between pb-6">
                          <p className="text-gray-800 dark:text-gray-50 mr-2">
                            Have an account?
                          </p>
                          <Link to="/login">
                            <button
                              type="button"
                              className="inline-block px-6 py-2 border-2 border-sky-500 text-sky-500 font-medium text-sm leading-tight  rounded hover:text-sky-600 hover:border-sky-600 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
                              aria-label="Login"
                            >
                              Login
                            </button>
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
