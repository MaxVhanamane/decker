import { FC, memo, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { AlertData } from "../types/types";
import { FaRegUser } from "react-icons/fa";
import { RiCloseFill, RiLogoutCircleRLine } from "react-icons/ri";
import ThemeToggler from "./ThemeToggler";
import SearchBar from "./SearchBar";
import { HiOutlineHome, HiOutlineSearch } from "react-icons/hi";
import { AiOutlineDelete } from "react-icons/ai";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import { OfflineContext } from "../context/OfflineContext";
import { AlertContext } from "../context/AlertContext";
import { searchContext } from "../context/SearchContext";
import { MdInstallDesktop, MdInstallMobile } from "react-icons/md";

const Navbar: FC = () => {
  const {
    divRefForUserSettings,
    userInfo,
    showInstallAppButton,
    handleInstallApp,
    showLogoutModal,
    setShowLogoutModal,
    isAuthenticating,
  } = useContext(UserContext);
  const { showSearchBar, setShowSearchBar, setOpenSearchBar } =
    useContext(searchContext);
  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [imageError, setImageError] = useState(false);
  const handleShowUserInfomation = () => {
    if (showLogoutModal) {
      divRefForUserSettings.current?.classList.add("transition-none");
    }
    if (divRefForUserSettings.current?.classList.contains("scale-0")) {
      divRefForUserSettings.current?.classList.add("!block");
      divRefForUserSettings.current?.classList.remove("scale-0");
      divRefForUserSettings.current?.classList.add("scale-100");
    } else {
      divRefForUserSettings.current?.classList.remove("scale-100");
      divRefForUserSettings.current?.classList.add("scale-0");
      divRefForUserSettings.current?.classList.add("hidden");
    }
  };

  const pathNames = [
    "/signup",
    "/verifyemail",
    "/forgotpassword",
    "/changepassword",
    "/login",
    "/accountdeletionsuccess",
  ];

  return (
    <>
      <nav
        className={`border-b ${
          localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
            ? "dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent"
            : "bg-[#fcfefc]"
        } border-slate-900/10  dark:border-b dark:border-slate-300/10 px-2  py-2 flex flex-row justify-between items-center sticky top-0 z-[60] h-[3.45rem]`}
      >
        <div className="flex items-center justify-center flex-row gap-8">
          <div
            onClick={() => {
              if (showSearchBar) {
                return;
              }
              if (
                divRefForUserSettings.current?.classList.contains("scale-100")
              ) {
                handleShowUserInfomation();
              }
              if (!pathNames.includes(location.pathname)) {
                if (location.pathname === "/") {
                  navigate("/", { replace: true });
                  return;
                } else {
                  navigate("/");
                }
              }
            }}
            className="flex items-center justify-center rounded px-2 gap-2"
          >
            <img
              src={`${
                localStorage.getItem("theme") === "dark" ||
                localStorage.getItem("theme") === null
                  ? "/decker_logo_dark.png"
                  : "/decker_logo_light.png"
              }`}
              className={`w-7 h-7 object-contain ${
                !pathNames.includes(location.pathname) ? "cursor-pointer" : ""
              }`}
              alt="decker logo"
            />
            <span
              className={`h-8 w-auto   ${
                localStorage.getItem("theme") === "dark" ||
                localStorage.getItem("theme") === null
                  ? "text-gray-50"
                  : "text-gray-700"
              } font-bold text-xl ${
                !pathNames.includes(location.pathname) ? "cursor-pointer" : ""
              }`}
            >
              <span className="inline-block transform hover:-translate-y-1 active:-translate-y-1 duration-300">
                D
              </span>
              <span className="inline-block transform hover:-translate-y-1  active:-translate-y-1 duration-300">
                e
              </span>
              <span className="inline-block transform hover:-translate-y-1  active:-translate-y-1 duration-300">
                c
              </span>
              <span className="inline-block transform hover:-translate-y-1  active:-translate-y-1 duration-300">
                k
              </span>
              <span className="inline-block transform hover:-translate-y-1  active:-translate-y-1 duration-300">
                e
              </span>
              <span className="inline-block transform hover:-translate-y-1  active:-translate-y-1 duration-300">
                r
              </span>
            </span>
          </div>
          <div className="hidden md:block">
            <ul className="flex gap-10  items-center justify-center">
              {userInfo?.email && location.pathname.split("/")[1] == "cards" ? (
                <Link to="/">
                  <li
                    className="dark:text-gray-50 text-gray-600 cursor-pointer  font-semibold transition-all duration-150 dark:hover:bg-gray-700 hover:bg-gray-100 hover:rounded-full p-[0.4rem] px-2"
                    onClick={() => {
                      if (showSearchBar) setOpenSearchBar(false);
                      if (
                        divRefForUserSettings.current?.classList.contains(
                          "scale-100"
                        )
                      ) {
                        handleShowUserInfomation();
                      }
                    }}
                  >
                    Home
                  </li>
                </Link>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 items-center justify-center ">
          {userInfo?.email && (
            <div className="flex items-center justify-center">
              <SearchBar />
              <button
                onClick={() => {
                  if (
                    divRefForUserSettings.current?.classList.contains(
                      "scale-100"
                    )
                  ) {
                    handleShowUserInfomation();
                  }
                  setShowSearchBar(true);
                }}
                disabled={showSearchBar}
                aria-label="Search"
              >
                <HiOutlineSearch
                  className={`text-lg dark:text-gray-100 text-gray-500 ${
                    !showSearchBar
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  } cursor-pointer transition-opacity lg:duration-[1200ms]  mr-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem] px-2  w-9 h-9`}
                />
              </button>
            </div>
          )}
          <div>
            <ul className="flex items-center justify-center gap-3">
              {!isAuthenticating && (
                <li className=" text-2xl mr-2 w-9 h-9 flex items-center justify-center p-[1.2rem]">
                  <ThemeToggler />
                </li>
              )}

              {userInfo?.email ? (
                <li
                  onClick={() => {
                    handleShowUserInfomation();
                  }}
                  className=" cursor-pointer   mr-1  rounded-full flex gap-2 px-2 items-center"
                >
                  {userInfo?.profile_picture && !imageError ? (
                    <img
                      onError={() => {
                        setImageError(true);
                      }}
                      className="rounded-full w-8 h-8 "
                      src={userInfo?.profile_picture}
                      alt="profile"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="rounded-full bg-gradient-to-tr from-teal-600 to-green-700 dark:from-sky-700 dark:to-green-700 w-8 h-8 flex items-center justify-center">
                      <FaRegUser className=" text-lg text-gray-50" />
                    </div>
                  )}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

      <div
        ref={divRefForUserSettings}
        className=" fixed transition duration-500 ease-in-out scale-0  right-6   px-5 py-2 pb-4  z-[90] "
      >
        <div className=" ring-1 dark:ring-sky-500 ring-teal-500 absolute right-4 top-4 shadow-md dark:shadow-sky-500 shadow-teal-500  bg-[#fcfefc]  rounded-md dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent mx-auto  ">
          <button
            onClick={handleShowUserInfomation}
            className="font-semibold absolute top-2 right-1 rounded px-1 text-center dark:text-gray-50  text-gray-700 cursor-pointer "
            aria-label="Close"
          >
            <RiCloseFill />
          </button>
          <h2 className="py-2 font-bold text-gray-700 dark:text-gray-50">
            My account
          </h2>

          <hr className="dark:border-sky-500 border-teal-500" />
          <div className="p-3">
            <ul className="flex flex-col items-start gap-2 text-gray-700 dark:text-gray-50 w-fit ">
              <li className="flex gap-1">
                <span className="font-semibold  w-fit">username:</span>{" "}
                {userInfo?.username}
              </li>
              <li className="flex gap-1">
                <span className="font-semibold  w-fit">email:</span>{" "}
                {userInfo?.email}
              </li>
            </ul>
          </div>
          <hr className="dark:border-sky-500 border-teal-500" />

          <div className="flex items-start justify-start flex-col px-3 gap-2 ">
            <button
              onClick={() => {
                if (showSearchBar) setShowSearchBar(false);
                if (isOnline) {
                  handleShowUserInfomation();
                  navigate("/account/deletemyaccount", {
                    state: { from: location.pathname },
                  });
                } else {
                  setAlert((preval: AlertData) => ({
                    ...preval,
                    severity: "error",
                    show: true,
                    message: "No internet connection",
                    autoHideDuration: 7000,
                  }));
                }
              }}
              className="font-semibold  rounded  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 flex items-center justify-center gap-2 transition-[color] duration-300 cursor-pointer  mt-3"
              aria-label="Delete My Account"
            >
              <AiOutlineDelete /> Delete My Account
            </button>

            <button
              onClick={handleInstallApp}
              className={` ${
                showInstallAppButton
                  ? "flex items-center justify-center gap-2"
                  : "hidden"
              } font-semibold  rounded text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 cursor-pointer `}
              aria-label="install app button"
            >
              <MdInstallMobile className="lg:hidden dark:text-gray-50 dark:hover:text-gray-300  text-gray-500 hover:text-gray-600 " />
              <MdInstallDesktop className="hidden lg:block text-lg" /> Install
              Decker
            </button>

            {userInfo?.email && location.pathname.split("/")[1] == "cards" ? (
              <button
                onClick={() => {
                  if (showSearchBar) setOpenSearchBar(false);
                  navigate("/");
                  handleShowUserInfomation();
                }}
                className="md:hidden font-semibold  rounded text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 cursor-pointer flex items-center justify-center gap-2"
                aria-label="Home"
              >
                <HiOutlineHome /> Home
              </button>
            ) : null}

            <button
              onClick={() => {
                if (isOnline) {
                  setShowLogoutModal(true);
                  navigate(location.pathname);
                } else {
                  setAlert((preval: AlertData) => ({
                    ...preval,
                    severity: "error",
                    show: true,
                    message: "No internet connection",
                    autoHideDuration: 7000,
                  }));
                }
              }}
              className="font-semibold  rounded  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 transition-[color] duration-300 cursor-pointer   pb-2 flex items-center justify-center gap-2"
              aria-label="Logout"
            >
              <RiLogoutCircleRLine />
              Logout
            </button>
          </div>
        </div>
      </div>
      {showLogoutModal && (
        <ConfirmLogoutModal
          handleShowUserInfomation={handleShowUserInfomation}
          setShowLogoutModal={setShowLogoutModal}
          showLogoutModal={showLogoutModal}
        />
      )}
    </>
  );
};

export default memo(Navbar);
