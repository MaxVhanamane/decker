import Session from "../components/Session";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const SessionExpired = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(UserContext);
  useEffect(() => {
    if (userInfo?.email) {
      navigate("/");
    }
  }, []);
  return !userInfo?.email ? <Session /> : null;
};

export default SessionExpired;
