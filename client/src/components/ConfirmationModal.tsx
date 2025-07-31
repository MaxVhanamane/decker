import { useEffect, useState, useRef } from "react";
import { useFocusTrap } from "../hooks/utility/useFocusTrap";
import Button from "./Button";

type ConfirmationModalProps = {
  showConfirmationModal: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  startClosingModalAnimation: boolean;
};

const TRANSITION_DURATION = 300;

const ConfirmationModal = ({
  showConfirmationModal,
  onConfirm,
  onCancel,
  message,
  startClosingModalAnimation,
}: ConfirmationModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(onConfirm, TRANSITION_DURATION);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(onCancel, TRANSITION_DURATION);
  };

  useFocusTrap(modalRef, "both", {
    onEscape: handleCancel,
  });

  useEffect(() => {
    if (!startClosingModalAnimation && showConfirmationModal) {
      setIsVisible(false);
      setTimeout(onCancel, TRANSITION_DURATION);
    } else if (startClosingModalAnimation && showConfirmationModal) {
      setIsVisible(true);
    }
  }, [startClosingModalAnimation, showConfirmationModal]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal"
      tabIndex={-1}
      className={`fixed inset-0 z-[90] flex items-center justify-center p-4 transition-all duration-200 ease-in-out backdrop-blur-md ${
        showConfirmationModal ? "visible" : "invisible"
      } ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className={`relative bg-white rounded-lg  dark:bg-slate-900 border dark:border-slate-500 border-slate-400 transition-transform duration-200 ${
            isVisible ? "scale-100" : "scale-95"
          }`}
        >
          <div className="p-6 text-center">
            <svg
              aria-hidden="true"
              className="mx-auto mb-4 text-gray-400 w-14 h-14 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              id="modal-title"
              className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
            >
              {message}
            </h3>
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="unstyled"
                id="yesbutton"
                aria-label="Yes, I'm sure"
                onClick={handleConfirm}
                type="button"
                className="text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
              >
                Yes, I'm sure
              </Button>
              <Button
                variant="unstyled"
                id="nobutton"
                aria-label="No, cancel"
                onClick={handleCancel}
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                No, cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
