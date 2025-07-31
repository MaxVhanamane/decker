import { useContext, useEffect } from "react";
import { ShowToastContext } from "../../context/ToastNotificationContext";

type UseToastOnErrorParams = {
  isError: boolean;
  error: Error | null;
  resetFunction: () => void;
  customFunction?: () => void;
};

const defaultErrorMessage = "Something went wrong!";
const useToastOnError = ({
  isError,
  error,
  resetFunction,
  customFunction,
}: UseToastOnErrorParams) => {
  const { showToast } = useContext(ShowToastContext);

  useEffect(() => {
    if (isError) {
      showToast({
        message: error?.message || defaultErrorMessage,
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      if (resetFunction) {
        resetFunction();
      }
      if (customFunction) {
        customFunction();
      }
    }
  }, [isError, error, resetFunction, showToast]);
};

export default useToastOnError;
