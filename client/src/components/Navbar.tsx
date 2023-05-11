import { FC, memo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { FaFeatherAlt } from "react-icons/fa";
import { userData } from "../types/types";
import { FaUserCircle } from "react-icons/fa";
import { RiCloseFill } from "react-icons/ri";
import ThemeToggler from "./ThemeToggler";
import SearchBar from "./SearchBar";
import { HiOutlineSearch } from "react-icons/hi";
import { AiOutlineWarning } from "react-icons/ai";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
const Navbar: FC = () => {
  const {
    showSearchBar,
    setShowSearchBar,
    divRefForUserSettings,
  } = useContext(UserContext);
  const userDetails = localStorage.getItem("userInfo");
  let userInfo: userData | undefined;
  if (userDetails) {
    userInfo = JSON.parse(userDetails);
  }
  const navigate = useNavigate();
  const location = useLocation();
const [showLogoutModal,setShowLogoutModal]=useState(false)
  const handleShowUserInfomation = () => {
    if (divRefForUserSettings.current?.classList.contains("scale-0")) {
      divRefForUserSettings.current?.classList.add("!block");
      divRefForUserSettings.current?.classList.remove("scale-0");
      divRefForUserSettings.current?.classList.add("scale-100");
    } else {
      divRefForUserSettings.current?.classList.remove("scale-100");
      divRefForUserSettings.current?.classList.add("scale-0");
      divRefForUserSettings.current?.classList.add("hidden");

      // divRefForUserSettings.current?.classList.add("md:block")
    }
  };

 
  return (
    <>
      <nav className="border-b bg-white border-slate-900/10 dark:bg-[#0c1221] dark:border-b dark:border-slate-300/10 px-2  py-2 flex flex-row justify-between items-center sticky top-0 z-[60] ">
        <div className="flex items-center justify-center flex-row gap-8">
          <Link to={"/"}>
            <div className="flex items-center justify-center rounded px-2 gap-2">
              <span className="text-xl text-teal-600 dark:text-sky-400">
                <FaFeatherAlt />
              </span>{" "}
              <span className="h-8 w-auto text-gray-700 dark:text-sky-50 font-bold text-xl">
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  D
                </span>
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  e
                </span>
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  c
                </span>
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  k
                </span>
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  e
                </span>
                <span className="inline-block transform hover:-translate-y-1 hover:duration-300">
                  r
                </span>
              </span>
            </div>
          </Link>
          <div className="hidden md:block">
            <ul className="flex gap-10  items-center justify-center">
              {userInfo?.email && location.pathname.split("/")[1] == "cards" ? (
                <Link to="/">
                  <li
                    className="dark:text-gray-50 text-gray-800 cursor-pointer dark:hover:text-sky-500 hover:text-gray-600 font-semibold transition-[color] duration-300"
                    onClick={() => {
                      if (showSearchBar) setShowSearchBar(false);
                    }}
                  >
                    Home
                  </li>
                </Link>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="flex gap-4 items-center justify-center ">
          {userInfo?.email && (
            <>
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
                  } cursor-pointer transition-opacity lg:duration-[1200ms] duration-500 mr-2`}
                />
              </button>
            </>
          )}
          <div>
            <ul className="flex items-center justify-center gap-3">
              <li className=" text-2xl mr-2 ">
                {" "}
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

        {/* <div className='flex items-center justify-center text-xl '>
      <span className='text-white'><RxHamburgerMenu/></span>
   
      </div> */}
      </nav>

      <div
        ref={divRefForUserSettings}
        className=" fixed transition duration-500 ease-in-out scale-0  right-6   px-5 py-2 pb-4  z-[90] "
      >
        <div className=" ring-1 dark:ring-sky-500 ring-teal-500 absolute right-4 top-4 shadow-md dark:shadow-sky-500 shadow-teal-500  bg-white  rounded-md dark:bg-[#0c1221] mx-auto  ">
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
                handleShowUserInfomation();
                navigate("/account/deletemyaccount", { state: { from: location.pathname } });
              }}
              className="font-semibold  rounded  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 flex items-center justify-center gap-2 transition-[color] duration-300 cursor-pointer  mt-3"
              aria-label="Delete My Account"
            >
              Delete My Account
              <AiOutlineWarning
                onClick={(e) => e.stopPropagation()}
                className="text-yellow-400 cursor-text"
              />
            </button>

            {userInfo?.email && location.pathname.split("/")[1] == "cards" ? (
              <button
                onClick={() => {
                    if (showSearchBar) setShowSearchBar(false);
                  navigate("/");
                  handleShowUserInfomation();
                }}
                className="md:hidden font-semibold  rounded text-center text-white cursor-pointer"
                aria-label="Home"
              >
                Home
              </button>
            ) : null}

            <button
              onClick={() => {
                setShowLogoutModal(true)
              }}
              className="font-semibold  rounded  text-center dark:text-gray-50 dark:hover:text-gray-300  text-gray-700 hover:text-gray-600 transition-[color] duration-300 cursor-pointer   pb-2"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {showLogoutModal && <ConfirmLogoutModal handleShowUserInfomation={handleShowUserInfomation} setShowLogoutModal={setShowLogoutModal} showLogoutModal={showLogoutModal}/>}
    </>
  );
};

export default memo(Navbar);
