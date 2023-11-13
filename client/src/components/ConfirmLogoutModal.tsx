import { FC, MouseEvent, useContext, Dispatch } from "react";
import { UserContext } from "../context/UserContext";
import { request } from "../utils/axios-utils";
import { useNavigate } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";

interface ConfirmLogoutModalProps {
  handleShowUserInfomation: () => void;
  setShowLogoutModal: Dispatch<React.SetStateAction<boolean>>;
  showLogoutModal: boolean;
}

const ConfirmLogoutModal: FC<ConfirmLogoutModalProps> = ({
  handleShowUserInfomation,
  setShowLogoutModal,
  showLogoutModal,
}) => {
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const { setAlert } = useContext(AlertContext);

  const getUserConfirmation = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    if ((e.target as HTMLButtonElement).id === "yesbutton") {
      const res = await request.post("/auth/logout");
      if (res.data === "done") {
        setUserInfo(null);
        setShowLogoutModal(false);
        handleShowUserInfomation();
        navigate("/login", { replace: true });
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: "Some error occured Please try again later!",
          autoHideDuration: 5000,
        }));
        setShowLogoutModal(false);
      }
    } else {
      setShowLogoutModal(false);
      navigate(-1);
    }
  };

  return (
    <div
      tabIndex={-1}
      className={`fixed ${
        showLogoutModal ? "block" : "hidden"
      } z-[90] p-4 overflow-x-hidden overflow-y-auto inset-0 backdrop-blur-xl dark:lg:dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent lg:backdrop-blur-none lg:bg-[#fcfefc]`}
    >
      <div className="relative w-full h-full flex items-center justify-center  ">
        <div className="relative bg-[#fcfefc] rounded-lg shadow-md dark:shadow-md shadow-teal-500 dark:shadow-sky-500 dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent ring-1 ring-sky-500  ">
          <div className="p-6 text-center">
            <svg
              aria-hidden="true"
              className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to Logout?
            </h3>
            <button
              id="yesbutton"
              aria-label="Yes,I'm sure"
              onClick={getUserConfirmation}
              data-modal-toggle="popup-modal"
              type="button"
              className="text-white bg-red-600 hover:bg-red-800    font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none"
            >
              Yes, I'm sure
            </button>
            <button
              id="nobutton"
              aria-label="No, cancel"
              onClick={getUserConfirmation}
              data-modal-toggle="popup-modal"
              type="button"
              className="text-gray-500 bg-[#fcfefc] hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
