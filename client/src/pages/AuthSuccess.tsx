import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { TiTick } from "react-icons/ti";
import { request } from "../utils/axios-utils";
import { userData } from "../types/types";
import { UserContext } from "../context/UserContext";

export default function AuthSuccess() {
  const { setUserInfo, setShowInstallAppButton } = useContext(UserContext);
  const navigate = useNavigate();
  const getUser = async (): Promise<userData> => {
    const userData = await request.get("/getuser");
    setUserInfo(userData.data);

    return userData.data;
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
      if (userInfo?.email) {
        timeout = setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      } else {
        navigate("/login", { replace: true });
      }

      return () => clearTimeout(timeout);
    })();
  }, []);
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col gap-3 dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent bg-[#fcfefc] -z-10">
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
