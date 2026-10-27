import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { TiTick } from "react-icons/ti";
import { request } from "../utils/fetch-utils";
import type { userData } from "../types/types";
import { UserContext } from "../context/UserContext";
import { ShowToastContext } from "../context/ToastNotificationContext";
import { UserStore } from "../utils/userStore";

type userInfo = userData & { email: string };

export default function AuthSuccess() {
  const { setUserInfo, setShowInstallAppButton, setUserEmailAddress } =
    useContext(UserContext);
  const { showToast } = useContext(ShowToastContext);
  const navigate = useNavigate();

  const getUser = async (): Promise<userInfo | null> => {
    try {
      const userData = await request.get("/api/v1/users");
      const { email } = (await request.get("/api/v1/users/email")).data;
      return { ...userData.data, email };
    } catch (error) {
      showToast({
        message:
          "Some error occured while fetching user details, please login again to continue.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return null;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("showInstallAppButton")) {
      localStorage.removeItem("showInstallAppButton");
      setShowInstallAppButton(true);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    (async () => {
      const userInfo = await getUser();

      // These if-else conditions are used to prevent the user from accessing this page directly via the URL.
      if (userInfo?.email && userInfo) {
        const { email, ...rest } = userInfo;
        setUserInfo(rest);
        UserStore.saveUser({
          profile_picture_url: rest.profile_picture,
          username: rest.username,
        });
        setUserEmailAddress(email);

        timeout = setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      } else {
        navigate("/login", { replace: true });
      }
    })();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col gap-3 dark:bg-slate-900 bg-white ">
      <div className="flex items-center justify-center rounded-full bg-green-700 text-white ">
        <p className="text-4xl">
          <TiTick />
        </p>
      </div>
      <div className=" text-gray-800 p-4 rounded-lg dark:text-gray-50">
        <p className="text-xl font-bold">Logged In successfully</p>
      </div>
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
        Redirecting to the home page......
      </p>
    </div>
  );
}
