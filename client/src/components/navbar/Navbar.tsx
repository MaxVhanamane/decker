import { memo, useState, useContext, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import ThemeToggler from "../ThemeToggler";
import SearchBar from "../search/SearchBar";
import { HiOutlineSearch } from "react-icons/hi";
import { searchContext } from "../../context/SearchContext";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { AudioContext } from "../../context/AudioContext";
import { ThemeContext } from "../../context/ThemeContext";
import UserMenu from "./UserMenu";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import ConfirmationModal from "../ConfirmationModal";
import { request } from "../../utils/fetch-utils";
import { useQueryClient } from "@tanstack/react-query";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { clearUserCache } from "../../utils/deleteCache";
import { CustomError } from "../../utils/customError";
import Button from "../Button";
import { useStableNavigate } from "../../context/StableNavigateContext";
import BulbControls from "./BulbControls";

const Navbar = () => {
  const { userInfo } = useContext(UserContext);
  const { showSearchBar, setShowSearchBar, setAnimateSearchBar } =
    useContext(searchContext);
  const { isPlayingAudioAllowed, setIsPlayingAudioAllowed, handlePlayAudio } =
    useContext(AudioContext);
  const { theme } = useContext(ThemeContext);
  const { setUserInfo, setUserEmailAddress } = useContext(UserContext);
  const { showToast } = useContext(ShowToastContext);

  const [modalState, setModalState] = useState({
    confirmLogoutModal: {
      show: false,
      startModalAnimation: false,
    },
  });
  const queryClient = useQueryClient();
  const navigate = useStableNavigate();
  const location = useLocation();

  const pathNames = [
    "/signup",
    "/verifyemail",
    "/forgotpassword",
    "/changepassword",
    "/login",
    "/accountdeletionsuccess",
  ];

  useModalBackNavigationHandler({
    isOpen: modalState.confirmLogoutModal.show,
    modalKey: "showLogoutModal",
    closeModal: () =>
      setModalState({
        confirmLogoutModal: {
          show: true,
          startModalAnimation: false,
        },
      }),
  });

  const handleOnConfirmLogout = async () => {
    try {
      const res = await request.post("/auth/logout");
      if (res?.data?.isLogoutSuccessful) {
        clearUserCache();
        queryClient.clear();
        setUserInfo(null);
        setUserEmailAddress(null);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("wasPreviouslyLoggedIn");
        setModalState((prev) => ({
          ...prev,
          confirmLogoutModal: { startModalAnimation: false, show: false },
        }));
        navigate("/login", { replace: true });
      } else {
        showToast({
          message: "Some error occured Please try again later!",
          severity: "error",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });

        setModalState((prev) => ({
          ...prev,
          confirmLogoutModal: { startModalAnimation: false, show: false },
        }));
      }
    } catch (error) {
      showToast({
        message: (error as CustomError)?.message
          ? (error as CustomError)?.message
          : "An error occurred during the logout process. Please try again later.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      setModalState((prev) => ({
        ...prev,
        confirmLogoutModal: { startModalAnimation: false, show: false },
      }));
    }
  };

  const handleOnCancelLogout = () => {
    setModalState((prev) => ({
      ...prev,
      confirmLogoutModal: { startModalAnimation: false, show: false },
    }));
  };

  return (
    <nav
      className={`border-b ${
        theme === "dark" || theme === null ? "bg-slate-900" : "bg-white"
      } border-slate-900/10  dark:border-b dark:border-slate-300/10 px-1 sm:px-2 flex flex-row justify-between items-center sticky top-0 z-[60] h-16 `}
    >
      <div className="flex items-center justify-center flex-row gap-8">
        <Button
          variant="plain"
          size="md"
          aria-label="Go to home page"
          type="button"
          onClick={() => {
            if (showSearchBar) {
              return;
            }

            if (!pathNames.includes(location.pathname)) {
              if (location.pathname !== "/") {
                navigate("/");
              }
            }
          }}
          className="flex items-center justify-center rounded p-2 gap-2 "
        >
          <img
            src="/decker_logo.png"
            className={`w-7 h-7 lg:w-8 lg:h-8 object-contain select-none ${
              !pathNames.includes(location.pathname) ? "cursor-pointer" : ""
            }`}
            alt="decker logo"
          />
          <span
            className={`h-8 w-auto select-none  ${
              theme === "dark" || theme === null
                ? "text-gray-50"
                : "text-gray-700"
            } font-bold text-lg sm:text-xl leading-7 sm:leading-normal  ${
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
        </Button>

        <div className="hidden md:block">
          <ul className="flex gap-10  items-center justify-center">
            {userInfo && location.pathname.split("/")[1] == "cards" ? (
              <Link to="/">
                <li
                  className="dark:text-gray-50 text-gray-600 cursor-pointer  font-semibold transition-all duration-300 dark:hover:bg-gray-700 hover:bg-gray-100 hover:rounded-full py-1.5 px-4"
                  onClick={() => {
                    if (showSearchBar) setAnimateSearchBar(false);
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
        <ul className="flex items-center justify-center md:gap-3">
          {userInfo && (
            <li className="flex items-center justify-center z-10">
              {showSearchBar && <SearchBar />}
              <Button
                variant="plain"
                size="md"
                aria-label="Open search bar"
                toolTipText="Open search bar"
                withTooltip
                type="button"
                disabled={showSearchBar}
                onClick={() => {
                  setShowSearchBar(true);

                  if (isPlayingAudioAllowed) {
                    setTimeout(() => {
                      handlePlayAudio("open");
                    }, 100);
                  }
                }}
                className={`rounded-full p-[0.4rem] w-10 h-10  dark:hover:bg-gray-700 hover:bg-gray-100 ${
                  !showSearchBar
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                } `}
              >
                <HiOutlineSearch
                  className={`text-xl dark:text-gray-200 text-gray-500  `}
                />
              </Button>
            </li>
          )}

          <li className="flex items-center justify-center rounded-full p-[0.4rem] w-10 h-10  dark:hover:bg-gray-700 hover:bg-gray-100">
            <ThemeToggler />
          </li>

          {userInfo ? (
            <>
              <li className="flex items-center justify-center relative">
                <BulbControls />
              </li>

              <li className="flex items-center justify-center  ">
                {isPlayingAudioAllowed ? (
                  <Button
                    variant="plain"
                    size="md"
                    aria-label="disable playing sound"
                    toolTipText="disable playing sound"
                    withTooltip
                    key="disable playing sound"
                    type="button"
                    onClick={() => {
                      setIsPlayingAudioAllowed(false);
                      localStorage.setItem("isPlayingAudioAllowed", "false");
                      handlePlayAudio("disable");
                    }}
                    className="rounded-full p-[0.4rem] w-10 h-10 dark:hover:bg-gray-700 hover:bg-gray-100 leading-none"
                  >
                    <HiMiniSpeakerWave className="dark:text-gray-200 text-gray-500 text-xl" />
                  </Button>
                ) : (
                  <Button
                    variant="plain"
                    size="md"
                    aria-label="enable playing sound"
                    toolTipText="enable playing sound"
                    withTooltip
                    key="enable playing sound"
                    type="button"
                    onClick={() => {
                      setIsPlayingAudioAllowed(true);
                      localStorage.setItem("isPlayingAudioAllowed", "true");
                      handlePlayAudio("enable");
                    }}
                    className="rounded-full p-[0.4rem] w-10 h-10 dark:hover:bg-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      height="1.25rem"
                      width="1.25rem"
                      xmlns="http://www.w3.org/2000/svg"
                      className="dark:text-gray-200 text-gray-500 text-xl"
                    >
                      <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05"></path>
                    </svg>
                  </Button>
                )}
              </li>
              <li className="flex items-center justify-center relative">
                <Suspense>
                  <UserMenu setModalState={setModalState} />
                </Suspense>
              </li>
            </>
          ) : null}
        </ul>
      </div>
      {modalState.confirmLogoutModal.show && (
        <ConfirmationModal
          message="Are you sure you want to log out of your account?"
          onCancel={handleOnCancelLogout}
          onConfirm={handleOnConfirmLogout}
          showConfirmationModal={modalState.confirmLogoutModal.show}
          startClosingModalAnimation={
            modalState.confirmLogoutModal.startModalAnimation
          }
        />
      )}
    </nav>
  );
};

export default memo(Navbar);
