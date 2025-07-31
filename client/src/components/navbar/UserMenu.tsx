import {
  Dispatch,
  memo,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { HiOutlineHome } from "react-icons/hi";
import { MdInstallDesktop, MdInstallMobile } from "react-icons/md";
import { RiCloseFill, RiLogoutCircleRLine } from "react-icons/ri";
import { UserContext } from "../../context/UserContext";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { searchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import { FaRegUser } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";

type PropType = {
  setModalState: Dispatch<
    SetStateAction<{
      confirmLogoutModal: { show: boolean; startModalAnimation: boolean };
    }>
  >;
};

const UserMenu = ({ setModalState }: PropType) => {
  const { userInfo, showInstallAppButton, handleInstallApp, userEmailAddress } =
    useContext(UserContext);
  const { isOnline } = useContext(OfflineContext);
  const { showToast } = useContext(ShowToastContext);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { showSearchBar, setShowSearchBar, setAnimateSearchBar } =
    useContext(searchContext);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleProfileToggle = () => {
    setShowUserProfile((prev) => !prev);
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const showNoInternetToast = () => {
    showToast({
      message: "No internet connection",
      severity: "error",
      autoHideDuration: 5000,
      position: "top-center",
      animationStyle: "scale-up",
      theme: "auto",
    });
  };

  const handleDeleteAccount = () => {
    if (showSearchBar) setShowSearchBar(false);
    if (isOnline) {
      navigate("/account/deletemyaccount", {
        state: { from: location.pathname },
      });
    } else {
      showNoInternetToast();
    }
  };

  const handleHomeNavigation = () => {
    if (showSearchBar) setAnimateSearchBar(false);
    navigate("/");
  };

  const handleLogout = () => {
    if (isOnline) {
      setModalState({
        confirmLogoutModal: {
          show: true,
          startModalAnimation: true,
        },
      });
    } else {
      showNoInternetToast();
    }
  };

  const profileButtonAriaLabel = showUserProfile
    ? "Close user profile and settings"
    : "Open user profile and settings";

  const profileButtonTooltip = showUserProfile
    ? "Close user profile and settings"
    : "Open user profile and settings";

  const shouldShowHomeButton =
    userEmailAddress && location.pathname.split("/")[1] === "cards";

  const shouldShowProfileImage = userInfo?.profile_picture && !imageError;

  useFocusTrap(containerRef, "tab", {
    onEscape: handleCloseProfile,
    enabled: showUserProfile,
  });

  useClickOutside(
    containerRef,
    showUserProfile,
    () => {
      if (showUserProfile) {
        handleCloseProfile();
      }
    },
    { excludeRefs: [buttonRef] }
  );

  return (
    <>
      <Button
        ref={buttonRef}
        variant="plain"
        size="md"
        aria-label={profileButtonAriaLabel}
        toolTipText={profileButtonTooltip}
        withTooltip
        type="button"
        onClick={handleProfileToggle}
        className="rounded-full  w-10 h-10 p-1 dark:hover:bg-gray-700 hover:bg-gray-100"
      >
        {shouldShowProfileImage ? (
          <img
            onError={handleImageError}
            className="rounded-full w-full h-full "
            src={userInfo?.profile_picture}
            alt="profile"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="rounded-full bg-gradient-to-tr from-teal-600 to-green-700 dark:from-sky-700 dark:to-green-700 w-full h-full flex items-center justify-center">
            <FaRegUser className=" text-lg text-gray-50" />
          </div>
        )}
      </Button>

      <div
        ref={containerRef}
        className={twMerge(
          "absolute -left-64 top-14 transition duration-300 ease-in-out z-[90] w-64  outline-none",
          showUserProfile
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-4 pointer-events-none"
        )}
      >
        <div className="ring-1 ring-sky-500/75 relative shadow-xl bg-white rounded-lg dark:bg-slate-900 mx-auto">
          <Button
            tabIndex={showUserProfile ? 0 : -1}
            variant="unstyled"
            withTooltip
            toolTipText="Close user profile and settings"
            onClick={handleCloseProfile}
            className="font-semibold absolute top-2 right-1 rounded px-1 text-center dark:text-gray-50  text-gray-700 cursor-pointer "
            aria-label="Close user profile and settings"
          >
            <RiCloseFill />
          </Button>

          <h2 className="py-2 font-bold text-gray-700 dark:text-gray-50">
            My account
          </h2>

          <hr className="border-sky-500/75" />

          <div className="p-2">
            <ul className="flex flex-col items-start gap-2 text-gray-700 dark:text-gray-50 ">
              <li className="flex gap-1 whitespace-nowrap w-fit px-1">
                <div className="relative group flex items-center justify-center gap-1">
                  <span className="font-semibold ">username:</span>
                  <span className="truncate text-ellipsis overflow-hidden max-w-[12rem]">
                    {userInfo?.username || "N/A"}
                  </span>
                  <div
                    className="absolute bottom-full left-0 mt-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
             bg-gray-800 text-white dark:bg-gray-100 dark:text-slate-900 
             text-xs rounded shadow-md py-2 px-3 z-10 
             max-w-[15rem] -translate-x-1 w-max break-words whitespace-normal 
             transition-opacity duration-300"
                  >
                    {userInfo?.username || "N/A"}
                  </div>
                </div>
              </li>
              <li className="flex gap-1 whitespace-nowrap">
                <div className="relative group flex items-center justify-center gap-1 px-1">
                  <span className="font-semibold  w-fit">email:</span>{" "}
                  <span className="truncate text-ellipsis overflow-hidden max-w-[12rem] inline-block">
                    {userEmailAddress || "N/A"}
                  </span>
                  <div
                    className="absolute top-full left-0 mt-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto
             bg-gray-800 text-white dark:bg-gray-100 dark:text-slate-900 
             text-xs rounded shadow-md py-2 px-3 z-10 
             max-w-[15rem] -translate-x-1 w-max break-words whitespace-normal 
             transition-opacity duration-300"
                  >
                    {userEmailAddress || "N/A"}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <hr className="border-sky-500/75" />

          <div className="flex items-start justify-start flex-col p-2 gap-2 ">
            <Button
              tabIndex={showUserProfile ? 0 : -1}
              variant="unstyled"
              onClick={handleDeleteAccount}
              className="font-semibold  rounded  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 flex items-center justify-center gap-2 px-1 transition-[color] duration-300 cursor-pointer "
              aria-label="Delete My Account"
            >
              <AiOutlineDelete /> Delete My Account
            </Button>

            <Button
              tabIndex={showUserProfile ? 0 : -1}
              variant="unstyled"
              onClick={handleInstallApp}
              className={twMerge(
                showInstallAppButton
                  ? "flex items-center justify-center gap-2"
                  : "hidden",
                "font-semibold rounded text-center px-1 dark:text-gray-50 dark:hover:text-gray-300 text-gray-700 hover:text-gray-600 cursor-pointer"
              )}
              aria-label="install app button"
            >
              <MdInstallMobile className="lg:hidden dark:text-gray-50 dark:hover:text-gray-300  text-gray-500 hover:text-gray-600 " />
              <MdInstallDesktop className="hidden lg:block text-lg" /> Install
              Decker
            </Button>

            {shouldShowHomeButton ? (
              <Button
                tabIndex={showUserProfile ? 0 : -1}
                variant="unstyled"
                onClick={handleHomeNavigation}
                className="md:hidden font-semibold px-1 rounded text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 cursor-pointer flex items-center justify-center gap-2"
                aria-label="Home"
              >
                <HiOutlineHome /> Home
              </Button>
            ) : null}

            <Button
              tabIndex={showUserProfile ? 0 : -1}
              variant="unstyled"
              onClick={handleLogout}
              className="font-semibold  rounded px-1  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 transition-[color] duration-300 cursor-pointer  flex items-center justify-center gap-2"
              aria-label="Logout"
            >
              <RiLogoutCircleRLine />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(UserMenu);
