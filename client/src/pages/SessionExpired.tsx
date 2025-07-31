import Session from "../components/Session";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const SessionExpired = () => {
  const navigate = useNavigate();
  const { userEmailAddress } = useContext(UserContext);
  useEffect(() => {
    if (userEmailAddress) {
      navigate("/");
    }
  }, []);
  return !userEmailAddress ? <Session /> : null;
};

export default SessionExpired;
