import { memo, useState, useContext, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import ThemeToggler from "../ThemeToggler";
import SearchBar from "../search/SearchBar";
import { HiOutlineSearch } from "react-icons/hi";
import { searchContext } from "../../context/SearchContext";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { useAudio } from "../../context/AudioContext";
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
import { useIsDeviceType } from "../../hooks/utility/useIsDeviceType";
import { SidebarContex } from "../../context/SidebarContext";

const Navbar = () => {
  const { userInfo } = useContext(UserContext);
  const { showSearchBar, setShowSearchBar } = useContext(searchContext);
  const { toggleSidebar } = useContext(SidebarContex);

  const { handlePlayAudio, isPlayingAudioAllowed, setIsPlayingAudioAllowed } =
    useAudio();
  const { theme } = useContext(ThemeContext);
  const isMobileOrTablet = useIsDeviceType("tablet");

  const { setUserInfo, setUserEmailAddress } = useContext(UserContext);
  const { showToast } = useContext(ShowToastContext);

  const [modalState, setModalState] = useState({
    confirmLogoutModal: {
      show: false,
      startClosingModalAnimation: false,
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
          startClosingModalAnimation: true,
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
          confirmLogoutModal: {
            startClosingModalAnimation: false,
            show: false,
          },
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
          confirmLogoutModal: {
            startClosingModalAnimation: false,
            show: false,
          },
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
        confirmLogoutModal: { startClosingModalAnimation: false, show: false },
      }));
    }
  };

  const handleOnCancelLogout = () => {
    setModalState((prev) => ({
      ...prev,
      confirmLogoutModal: { startClosingModalAnimation: false, show: false },
    }));
  };

  return (
    <nav
      className={`border-b ${
        theme === "dark" || theme === null ? "bg-slate-900" : "bg-white"
      } border-slate-900/10  dark:border-slate-300/10 px-1 sm:px-2 flex flex-row justify-between items-center sticky top-0 z-[60] h-16 `}
    >
      <div className="flex items-center justify-center flex-row gap-8 ml-[1px]">
        {location.pathname === "/" && (
          <div className="flex items-center justify-center rounded gap-2 ml-1 lg:ml-auto">
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
                  ? "text-gray-200"
                  : "text-gray-700"
              } font-bold text-lg sm:text-xl leading-7 sm:leading-normal  ${
                !pathNames.includes(location.pathname) ? "cursor-pointer" : ""
              }`}
            >
              {"Decker".split("").map((char, index) => {
                return (
                  <span
                    key={index}
                    className="inline-block transform hover:-translate-y-1 active:-translate-y-1 duration-300"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </div>
        )}
        {location.pathname.startsWith("/cards") && isMobileOrTablet && (
          <div className="flex items-center justify-center rounded p-2 px-2.5 gap-2">
            <Button variant="unstyled" onClick={() => toggleSidebar(true)}>
              <svg
                width="25"
                height="25"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                data-rtl-flip=""
                className="text-2xl dark:text-gray-200 text-gray-700 cursor-pointer"
              >
                <path d="M11.6663 12.6686L11.801 12.6823C12.1038 12.7445 12.3313 13.0125 12.3313 13.3337C12.3311 13.6547 12.1038 13.9229 11.801 13.985L11.6663 13.9987H3.33325C2.96609 13.9987 2.66839 13.7008 2.66821 13.3337C2.66821 12.9664 2.96598 12.6686 3.33325 12.6686H11.6663ZM16.6663 6.00163L16.801 6.0153C17.1038 6.07747 17.3313 6.34546 17.3313 6.66667C17.3313 6.98788 17.1038 7.25586 16.801 7.31803L16.6663 7.33171H3.33325C2.96598 7.33171 2.66821 7.03394 2.66821 6.66667C2.66821 6.2994 2.96598 6.00163 3.33325 6.00163H16.6663Z"></path>
              </svg>
            </Button>
          </div>
        )}
        {/* 
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
        </div> */}
      </div>

      <div className="flex gap-3 items-center justify-center px-[0.3125rem] lg:px-0">
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

                  setTimeout(() => {
                    handlePlayAudio("open");
                  }, 100);
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
            modalState.confirmLogoutModal.startClosingModalAnimation
          }
        />
      )}
    </nav>
  );
};

export default memo(Navbar);
