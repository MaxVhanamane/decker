import { useContext, useCallback } from 'react'
import { request } from '../../utils/fetch-utils';
import { UserContext } from '../../context/UserContext';
import { UserStore } from '../../utils/userStore';
import { pathNames } from '../../constants/paths';
import { useStableNavigate } from '../../context/StableNavigateContext';
import { useLocation } from 'react-router-dom';
import { CustomError } from '../../utils/customError';

const useUser = () => {
    const { setUserInfo, setUserEmailAddress } = useContext(UserContext);
    const navigate = useStableNavigate();
    const location = useLocation();

    const getUser = useCallback(async () => {
        try {
            const userInfoResponse = await request.get("/getuser");
            const userData = userInfoResponse?.data;

            try {
                const emailResponse = await request.get("/user/email");
                const { email } = emailResponse.data;
                setUserEmailAddress(email || null);
            } catch {
                setUserEmailAddress(null);
            }

            if (userData) {
                setUserInfo(userData);
                UserStore.saveUser({
                    profile_picture_url: userData.profile_picture,
                    username: userData.username,
                });
                return;
            }

            const currentPath = location.pathname;

            if (pathNames.includes(currentPath)) {
                navigate(currentPath);
            } else {
                navigate("/login");
            }
        } catch (error) {
            const isSessionExpired =
                (error as CustomError)?.message ===
                "Your session has expired. Please log in again to continue." &&
                localStorage.getItem("wasPreviouslyLoggedIn") === "true";

            if (isSessionExpired) {
                setUserInfo(null);
                setUserEmailAddress(null);
                localStorage.removeItem("userInfo");
                localStorage.removeItem("wasPreviouslyLoggedIn");
                navigate("/sessionexpired");
                return;
            }

            navigate("/login");
        }
    }, [setUserInfo, setUserEmailAddress, navigate, location.pathname]);

    return { getUser };
};

export default useUser;
