import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useContext } from "react";
import { ChangeEvent } from "react";
import { request } from "./../utils/axios-utils";
import { UserContext } from "../context/UserContext";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";
import { OfflineContext } from "../context/OfflineContext";
export default function ChangePassword() {
  const location = useLocation();

  // Parse the query string using the URLSearchParams API
  const searchParams = new URLSearchParams(location.search);
  const { setAlert } = useContext(AlertContext);
  // Get the value of a parameter
  const emailAddress = searchParams.get("email");
  const otp = searchParams.get("otp");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const { isOnline } = useContext(OfflineContext);

  useEffect(() => {
    if (userInfo?.email || !emailAddress || !otp) {
      navigate("/");
    }
  }, [userInfo?.email]);

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
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }

    if (password === confirmPass) {
      if (password.length > 7 && confirmPass.length > 7) {
        const data = { email: emailAddress, otp: otp, newPassword: password };
        const res = await request.post("/changepassword", data);
        if (res.data.success) {
          setAlert((preval: AlertData) => ({
            ...preval,
            severity: "success",
            show: true,
            message: res.data.message,
          }));
          setConfirmPass("");
          setPassword("");
          navigate("/login");
        } else {
          setAlert((preval: AlertData) => ({
            ...preval,
            severity: "error",
            show: true,
            message: res.data.message,
          }));
        }
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: "password must be at least 8 characters long",
        }));
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "Password and confirm password didn't match",
      }));
    }
  };
  return (
    <>
      <section className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        <div className="  px-6 h-full">
          <div className="flex justify-center items-center flex-wrap h-full  text-gray-800 pt-[3.45rem]">
            <div className="xl:w-6/12">
              <div className="block bg-[#fcfefc] shadow-lg rounded-lg dark:bg-slate-950 dark:border dark:shadow-md dark:shadow-sky-500 dark:border-sky-500">
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

                        <h4 className="text-xl font-semibold mt-1 mb-3 pb-1 text-gray-700 dark:text-gray-50">
                          Change Password
                        </h4>
                      </div>
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                          <input
                            onChange={handleChange}
                            type="password"
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-950 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                            id="password"
                            name="password"
                            value={password}
                            placeholder="New password"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <input
                            onChange={handleChange}
                            type="password"
                            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-[#fcfefc] bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-[#fcfefc] focus:border-cyan-600 focus:outline-none dark:border-gray-300/40 dark:bg-slate-950 dark:focus:ring-gray-100/40 dark:focus:ring-1 dark:text-gray-50"
                            id="confirmpassword"
                            name="confirmPass"
                            value={confirmPass}
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                        <div className="text-center pt-1 mb-5 pb-1">
                          <button
                            className="  inline-block px-6 py-2.5 text-white font-medium text-sm leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-teal-600 hover:bg-teal-700 dark:bg-sky-600 dark:hover:bg-sky-700 outline-none"
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
                              className="inline-block px-6 py-2 border-2 border-teal-600 text-teal-700 dark:border-sky-500 dark:text-sky-500 font-medium text-sm leading-tight  rounded hover:border-teal-500 hover:text-teal-600 dark:hover:text-sky-600 dark:hover:border-sky-400 focus:outline-none focus:ring-0 transition duration-150 ease-in-out"
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
