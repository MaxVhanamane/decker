import { FC, memo, useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { AlertData } from "../types/types";
import { FaUserCircle } from "react-icons/fa";
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

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  prompt(): Promise<void>;
}

const Navbar: FC = () => {
  const {
    divRefForUserSettings,
    userInfo,
    showInstallAppButton,
    setShowInstallAppButton,
  } = useContext(UserContext);
  const { showSearchBar, setShowSearchBar, setOpenSearchBar } =
    useContext(searchContext);
  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleShowUserInfomation = () => {
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

  useEffect(() => {
    let deferredPrompt: any;

    const beforeInstallHandler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      if (event) {
        if (pathNames.includes(location.pathname)) {
          // "Storing the showInstallAppButton value in local storage and using it on the Auth Success page to set the showInstallAppButton global state is necessary. This is because, when a user is on the login page and we set setShowInstallAppButton(true), this state will lose its value if the user uses Google Login. Google Login redirects the user to an external URL, and when they return to the app after logging in, the showInstallAppButton state will revert to its default value, which is false. Consequently, the 'Install Decker App' button won't be displayed because the beforeinstallprompt event only fires once when the app loads. To prevent this, we save the value in local storage and use it on the Auth Success page, removing it from there afterward. We've used an if condition to set the value in local storage to avoid unnecessary updates when the user refreshes the page while logged in, triggering the beforeinstallprompt event." I have placed setShowInstallAppButton(true) outside the if statement because if the user refreshes the page on the home screen, it will set the value, and I will see the 'Install Decker App' button; otherwise, I won't see that button.
          localStorage.setItem("showInstallAppButton", JSON.stringify(true));
        }
        setShowInstallAppButton(true);
      }

      deferredPrompt = event;
    };

    const installApp = document.getElementById("install-button");

    const clickHandler = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPrompt = null;
        }
      }
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    installApp?.addEventListener("click", clickHandler);

    // Remove event listeners when the component unmounts
    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      installApp?.removeEventListener("click", clickHandler);
    };
  }, []);

  return (
    <>
      <nav
        className={`border-b ${
          localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
            ? "dark:bg-slate-950"
            : "bg-[#fcfefc]"
        } border-slate-900/10 dark: dark:border-b dark:border-slate-300/10 px-2  py-2 flex flex-row justify-between items-center sticky top-0 z-[60]`}
      >
        <div className="flex items-center justify-center flex-row gap-8">
          <div
            onClick={() => {
              if (showSearchBar) {
                setOpenSearchBar(false);
              }
              if (
                divRefForUserSettings.current?.classList.contains("scale-100")
              ) {
                handleShowUserInfomation();
              }
              if (!pathNames.includes(location.pathname)) {
                navigate("/");
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
              <li className=" text-2xl mr-2 w-9 h-9 flex items-center justify-center p-[1.2rem]">
                <ThemeToggler />
              </li>

              {userInfo?.email ? (
                <li
                  onClick={() => {
                    handleShowUserInfomation();
                  }}
                  className=" cursor-pointer   mr-1  rounded-full flex gap-2 px-2 items-center"
                >
                  {" "}
                  {userInfo?.profile_picture ? (
                    <img
                      className="rounded-full w-8 h-8 "
                      src={userInfo?.profile_picture}
                      alt="profile"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 dark:text-sky-500 text-gray-600 " />
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
        <div className=" ring-1 dark:ring-sky-500 ring-teal-500 absolute right-4 top-4 shadow-md dark:shadow-sky-500 shadow-teal-500  bg-[#fcfefc]  rounded-md dark:bg-slate-950 mx-auto  ">
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
              id="install-button"
              className={` ${
                showInstallAppButton
                  ? "flex items-center justify-center gap-2"
                  : "hidden"
              } font-semibold  rounded text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 cursor-pointer `}
              aria-label="install app button"
            >
              <MdInstallMobile className="lg:hidden dark:text-gray-50 dark:hover:text-gray-300  text-gray-500 hover:text-gray-600 " />{" "}
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
