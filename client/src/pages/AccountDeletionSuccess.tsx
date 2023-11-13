import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { TiTick } from "react-icons/ti";
import { useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
export default function AccountDeletionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(UserContext);
  const accountDeletedSuccessfully = location.state?.accountDeletedSuccessfully;
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    // These if-else conditions are used to prevent the user from accessing this page directly via the URL.
    if (accountDeletedSuccessfully) {
      timeout = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 5000);
    } else if (userInfo) {
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
    // Clean up the timeout when the component unmounts
    return () => clearTimeout(timeout);
  }, []);

  return accountDeletedSuccessfully ? (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col gap-3 dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent bg-[#fcfefc] -z-10">
      <div className="flex items-center justify-center rounded-full bg-green-700 text-white ">
        <p className="text-4xl">
          <TiTick />
        </p>
      </div>
      <div className=" text-gray-800 p-4 rounded-lg dark:text-gray-50">
        <p className="text-xl font-semibold">
          Your account has been successfully deleted. You will now be redirected
          to the login page
        </p>
      </div>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
        Redirecting to the Login page......
      </p>
    </div>
  ) : null;
}
