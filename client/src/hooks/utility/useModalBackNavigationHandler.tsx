import { useEffect, useRef } from "react";

interface UseModalBackNavigationHandlerProps {
  isOpen: boolean;
  modalKey: string;
  closeModal: () => void;
}

const openModalStack: string[] = [];
const modalCloseCallbacks = new Map<string, () => void>();
let pendingManualCloses = new Set<string>(); // Track which modals are being closed manually
let isListenerAttached = false;

const handleGlobalPopState = () => {
  // If we have pending manual closes, this popstate is from a manual close
  if (pendingManualCloses.size > 0) {
    const modalKey = Array.from(pendingManualCloses)[0]; // Get first pending close
    pendingManualCloses.delete(modalKey);

    return;
  }

  // This is a genuine browser back button press
  if (openModalStack.length > 0) {
    const lastModalKey = openModalStack[openModalStack.length - 1];
    const closeCallback = modalCloseCallbacks.get(lastModalKey);

    if (closeCallback) {
      // Remove from stack and callback map immediately to prevent re-entry
      const index = openModalStack.indexOf(lastModalKey);
      if (index !== -1) {
        openModalStack.splice(index, 1);
        modalCloseCallbacks.delete(lastModalKey);
      }

      closeCallback();
    }
  }
};

export const useModalBackNavigationHandler = ({
  isOpen,
  modalKey,
  closeModal,
}: UseModalBackNavigationHandlerProps) => {
  const closeModalRef = useRef(closeModal);
  const wasOpenRef = useRef(false);

  // Keep close callback up to date
  useEffect(() => {
    closeModalRef.current = closeModal;
    if (isOpen && modalCloseCallbacks.has(modalKey)) {
      modalCloseCallbacks.set(modalKey, closeModal);
    }
  }, [closeModal, modalKey, isOpen]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      // Modal is opening
      if (!openModalStack.includes(modalKey)) {
        openModalStack.push(modalKey);
        modalCloseCallbacks.set(modalKey, closeModalRef.current);

        // Add history entry
        window.history.pushState({ modalKey, timestamp: Date.now() }, "");
      }

      // Attach global listener if not already attached
      if (!isListenerAttached) {
        window.addEventListener("popstate", handleGlobalPopState);
        isListenerAttached = true;
      }
    } else if (!isOpen && wasOpen) {
      // Modal is closing
      const modalIndex = openModalStack.indexOf(modalKey);
      if (modalIndex !== -1) {
        // Remove from stack and callbacks
        openModalStack.splice(modalIndex, 1);
        modalCloseCallbacks.delete(modalKey);

        // Mark as manual close and go back in history
        pendingManualCloses.add(modalKey);

        // Use setTimeout to ensure the history.back() happens after state updates
        setTimeout(() => {
          window.history.back();
        }, 0);
      }

      // Remove listener if no modals are open
      if (openModalStack.length === 0 && isListenerAttached) {
        window.removeEventListener("popstate", handleGlobalPopState);
        isListenerAttached = false;
        pendingManualCloses.clear(); // Clear any remaining pending closes
      }
    }
  }, [isOpen, modalKey]);
};
