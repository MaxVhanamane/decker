import { useEffect, useCallback, useRef, useLayoutEffect, useState } from "react";

type NavigationMode = 'tab' | 'arrow' | 'both';
type ScrollBehavior = "auto" | "instant" | "smooth"

type UseFocusTrapOptions = {
    enabled?: boolean;
    onEscape?: () => void;
    onEnter?: () => void;
    initialFocusIndex?: number;
    trackInputMethod?: boolean;
    scrollBehavior?: ScrollBehavior;
};

// Global modal stack management 
type ModalEntry = {
    id: string;
    containerRef: React.RefObject<HTMLElement>;
    handleFocusIn: (e: FocusEvent) => void;
    timestamp: number;
    opener: HTMLElement | null;
    openedWithKeyboard: boolean;
};

// Module-level state for managing focus traps
let modalStack: ModalEntry[] = [];
let idCounter = 0;
let globalListenerAttached = false;

const sortStackByTimestamp = (): void => {
    modalStack.sort((a, b) => a.timestamp - b.timestamp);
};


const updateGlobalListener = () => {
    if (modalStack.length > 0 && !globalListenerAttached) {
        document.addEventListener("focusin", handleFocusInGlobal, true);
        globalListenerAttached = true;
    } else if (modalStack.length === 0 && globalListenerAttached) {
        document.removeEventListener("focusin", handleFocusInGlobal, true);
        globalListenerAttached = false;
    }
};

const registerFocusTrap = (
    containerRef: React.RefObject<HTMLElement>,
    handleFocusIn: (e: FocusEvent) => void
): string => {
    const id = `focus-trap-${++idCounter}`;
    const ae = document.activeElement as HTMLElement | null;

    const modal: ModalEntry = {
        id,
        containerRef,
        handleFocusIn,
        timestamp: Date.now(),
        opener: ae,
        openedWithKeyboard: ae?.matches(":focus-visible") ?? false,
    };

    modalStack.push(modal);
    sortStackByTimestamp();
    updateGlobalListener();

    return id;
};

const unregisterFocusTrap = (id: string): void => {
    const closing = modalStack.find((m) => m.id === id) || null;
    const wasTop = isTopModal(id);

    modalStack = modalStack.filter((m) => m.id !== id);
    updateGlobalListener();

    if (wasTop && closing) {
        // only restore if there’s no newer modal still open
        const newerStillOpen = modalStack.some(
            (m) => m.timestamp > closing.timestamp
        );
        if (!newerStillOpen) {
            restoreFocus(closing);
        }
    }
};

const handleFocusInGlobal = (e: FocusEvent) => {
    if (modalStack.length === 0) return;

    const top = modalStack[modalStack.length - 1];
    if (!top.containerRef.current) return;

    if (!top.containerRef.current.contains(e.target as Node)) {
        // redirect focus back into modal
        top.handleFocusIn(e);
    }
};

const isTopModal = (id: string): boolean => {
    if (modalStack.length === 0) return false;
    const topModal = modalStack[modalStack.length - 1];
    return topModal.id === id;
};

const isFocusable = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    if (!document.contains(el)) return false;

    const style = window.getComputedStyle(el);
    if (
        style.display === "none" ||
        style.visibility === "hidden"
    ) {
        return false;
    }

    if (el.hasAttribute("disabled")) return false;
    if (typeof el.tabIndex === "number" && el.tabIndex < 0) return false;

    return true;
};


const restoreFocus = (entry: ModalEntry) => {
    let target: HTMLElement | null = entry.opener;
    let withKeyboard = entry.openedWithKeyboard;

    // climb backwards until we find a valid focus target
    while (target && !isFocusable(target)) {
        const prev = modalStack.findLast((m) => m.timestamp < entry.timestamp);
        if (!prev) {
            target = null;
            break;
        }
        target = prev.opener;
        withKeyboard = prev.openedWithKeyboard;
    }

    if (target && withKeyboard) {
        try {
            target.focus();
        } catch {
            // ignore
        }
    }
};

// Function overloads
export function useFocusTrap(
    containerRef: React.RefObject<HTMLElement>,
    navigationMode: NavigationMode,
    options: UseFocusTrapOptions & { trackInputMethod: true }
): { isUsingKeyboard: boolean };

export function useFocusTrap(
    containerRef: React.RefObject<HTMLElement>,
    navigationMode: NavigationMode,
    options?: UseFocusTrapOptions
): void;

export function useFocusTrap(
    containerRef: React.RefObject<HTMLElement>,
    navigationMode: NavigationMode,
    {
        enabled = true,
        onEscape,
        initialFocusIndex,
        trackInputMethod = false,
        scrollBehavior = 'auto',
        onEnter
    }: UseFocusTrapOptions = {}
): { isUsingKeyboard: boolean } | void {
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);
    const focusableElementsRef = useRef<HTMLElement[]>([]);
    const isKeyboardNavigatingRef = useRef(false);
    const modalIdRef = useRef<string | null>(null);
    const openedWithKeyboardRef = useRef(false);
    // Cache the focusable elements selector for performance
    const focusableSelector = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

    /**
     * Gets the tabbable radio button from a radio group
     * Only one radio button per group should be tabbable
     */
    const getTabbableRadioButton = useCallback((radioButtons: HTMLInputElement[]): HTMLInputElement | null => {
        if (radioButtons.length === 0) return null;
        // Find the checked radio button first
        const checkedRadio = radioButtons.find(radio => radio.checked);
        if (checkedRadio) return checkedRadio;
        // If no checked radio, return the first one in the group
        return radioButtons[0];
    }, []);

    /**
     * Focuses an element and ensures it's properly scrolled into view
     */
    const focusElementWithScroll = useCallback((element: HTMLElement) => {
        // Focus the element first
        element.focus({ preventScroll: true }); // Prevent default scroll

        // Then manually control the scroll behavior
        requestAnimationFrame(() => {
            // Find the first scrollable parent
            const findScrollableParent = (el: HTMLElement): HTMLElement | null => {
                let parent = el.parentElement;
                while (parent) {
                    const style = window.getComputedStyle(parent);
                    const hasVerticalScroll = parent.scrollHeight > parent.clientHeight;
                    const overflowY = style.overflowY;
                    if (hasVerticalScroll && (overflowY === 'auto' || overflowY === 'scroll')) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return null;
            };

            const container = findScrollableParent(element);
            if (container) {
                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const padding = 10; // Adjust this value for more/less padding

                // Check if element is too close to top or bottom edges
                const distanceFromTop = elementRect.top - containerRect.top;
                const distanceFromBottom = containerRect.bottom - elementRect.bottom;

                if (distanceFromTop < padding) {
                    // Too close to top, scroll up with padding
                    container.scrollBy({
                        top: distanceFromTop - padding,
                        behavior: scrollBehavior
                    });
                } else if (distanceFromBottom < padding) {
                    // Too close to bottom, scroll down with padding
                    container.scrollBy({
                        top: padding - distanceFromBottom,
                        behavior: scrollBehavior
                    });
                }
            } else {
                // Fallback to standard scrollIntoView
                element.scrollIntoView({
                    behavior: scrollBehavior,
                    block: 'center',
                    inline: 'nearest'
                });
            }
        });
    }, [scrollBehavior]);

    /**
     * Gets all focusable elements within the container, with special handling for radio groups
     * This is called frequently, so we memoize it for performance
     */
    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];

        const allElements = Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        );

        // Filter out elements that are not visible
        const visibleElements = allElements.filter(element => {
            // Check if element is visible (not hidden by CSS)
            const style = window.getComputedStyle(element);
            return style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                element.offsetParent !== null;
        });

        // Group radio buttons by name to handle them specially
        const radioGroups = new Map<string, HTMLInputElement[]>();
        const nonRadioElements: HTMLElement[] = [];

        visibleElements.forEach(element => {
            if (element instanceof HTMLInputElement && element.type === 'radio') {
                const name = element.name || `__unnamed_${element.id || Math.random()}`;
                if (!radioGroups.has(name)) {
                    radioGroups.set(name, []);
                }
                radioGroups.get(name)!.push(element);
            } else {
                nonRadioElements.push(element);
            }
        });

        // Build the final focusable elements list
        const focusableElements: HTMLElement[] = [];

        // Add non-radio elements and one representative from each radio group
        visibleElements.forEach(element => {
            if (element instanceof HTMLInputElement && element.type === 'radio') {
                const name = element.name || `__unnamed_${element.id || Math.random()}`;
                const radioGroup = radioGroups.get(name);
                if (radioGroup) {
                    const tabbableRadio = getTabbableRadioButton(radioGroup);
                    // Only add if this is the tabbable radio and we haven't added it yet
                    if (element === tabbableRadio && !focusableElements.includes(tabbableRadio)) {
                        focusableElements.push(tabbableRadio);
                    }
                }
            } else {
                focusableElements.push(element);
            }
        });

        return focusableElements;
    }, [containerRef, focusableSelector, getTabbableRadioButton]);

    /**
     * Updates the cached focusable elements reference
     * This is called when the DOM changes to keep our element list current
     */
    const updateFocusableElements = useCallback(() => {
        focusableElementsRef.current = getFocusableElements();
    }, [getFocusableElements]);

    /**
     * Determines if an element should handle its own arrow key navigation
     * Some elements like radio buttons, sliders, and select elements have built-in arrow key behavior
     * that we should not interfere with
     */
    const shouldElementHandleOwnArrows = useCallback((element: HTMLElement, key: string): boolean => {
        // For text inputs, only handle left/right arrows for cursor movement
        // Allow up/down arrows to be handled by the focus trap for navigation
        if (element instanceof HTMLInputElement && ['text', 'password', 'search', 'url', 'email', 'tel'].includes(element.type)) {
            return key === 'ArrowLeft' || key === 'ArrowRight';
        }

        // For textarea, only handle left/right arrows for cursor movement
        // Allow up/down arrows to be handled by the focus trap for navigation
        if (element.tagName === 'TEXTAREA') {
            return key === 'ArrowLeft' || key === 'ArrowRight';
        }

        // Only return true for elements that the BROWSER natively handles arrow keys for
        // Radio buttons - browser natively handles arrow keys to move between radio options in same group
        if (element instanceof HTMLInputElement && element.type === 'radio') {
            return true;
        }

        // Range sliders - browser natively handles arrow keys to adjust the value
        if (element instanceof HTMLInputElement && element.type === 'range') {
            return true;
        }

        // Number inputs - browser natively handles arrow keys to increment/decrement
        if (element instanceof HTMLInputElement && element.type === 'number') {
            return true;
        }

        // Date/time inputs - browser natively handles arrow keys to adjust date/time values
        if (element instanceof HTMLInputElement && ['date', 'time', 'datetime-local', 'month', 'week'].includes(element.type)) {
            return true;
        }

        // Select elements - browser natively handles arrow keys to navigate options
        if (element.tagName === 'SELECT') {
            return true;
        }

        // Contenteditable elements - browser natively handles arrow keys for cursor movement
        if (element.contentEditable === 'true') {
            return true;
        }

        // ARIA roles that have native browser arrow key support
        const role = element.getAttribute('role');
        if (role) {
            // Only include roles that browsers actually provide arrow key navigation for
            const nativeArrowRoles = [
                'listbox',      // Browser handles arrow keys for option selection
                'combobox',     // Browser handles arrow keys for dropdown navigation
                'slider',       // Browser handles arrow keys for value adjustment
                'spinbutton',   // Browser handles arrow keys for value increment/decrement
                'tablist',      // Browser handles arrow keys for tab navigation
                'radiogroup'    // Browser handles arrow keys for radio button navigation
            ];
            if (nativeArrowRoles.includes(role)) {
                return true;
            }
        }

        // All other elements should NOT handle their own arrow keys
        // This includes: regular buttons, links, divs, spans, etc.
        return false;
    }, []);

    /**
     * Handles focus events to ensure focus stays within the container
     * Now respects modal priority - only top modal handles focus
     */
    const handleFocusIn = useCallback((e: FocusEvent) => {
        if (!enabled || !containerRef.current || !modalIdRef.current) return;

        // Only handle focus if this is the top modal
        if (!isTopModal(modalIdRef.current)) {
            return;
        }

        const target = e.target as HTMLElement;
        // If focus moved outside the container, bring it back
        if (!containerRef.current.contains(target)) {
            e.preventDefault();
            const focusableElements = getFocusableElements();
            if (focusableElements.length > 0) {
                // Focus the first available element
                focusElementWithScroll(focusableElements[0]);
            } else {
                // Fallback to container
                containerRef.current.focus();
            }
        }
    }, [enabled, containerRef, getFocusableElements, focusElementWithScroll]);

    /**
     * Main keyboard event handler
     * Handles focus trapping (Tab/Shift+Tab) and optional arrow key navigation
     * Now respects modal priority - only top modal handles keyboard events
     */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!enabled || !containerRef.current || !modalIdRef.current) return;

            // Only handle keyboard events if this is the top modal
            if (!isTopModal(modalIdRef.current)) {
                return;
            }

            // Track keyboard usage for accessibility purposes (if enabled)
            if (
                trackInputMethod &&
                ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter', 'Space'].includes(e.key)
            ) {
                setIsUsingKeyboard(true);
                isKeyboardNavigatingRef.current = true;
            }

            // PREVENT TAB NAVIGATION: If we're not in tab mode, prevent tabbing out of the container
            if (e.key === "Tab" && navigationMode !== 'tab' && navigationMode !== 'both') {
                e.preventDefault();
                return;
            }
            // ENTER KEY: only if onEnter is provided
            if (e.key === "Enter" && onEnter) {
                e.preventDefault();
                onEnter();
                return;
            }


            // FOCUS TRAPPING: Handle Tab/Shift+Tab to keep focus within the container
            if (e.key === "Tab" && (navigationMode === 'tab' || navigationMode === 'both')) {
                // Always prevent default to ensure focus stays trapped
                e.preventDefault();
                const focusableElements = getFocusableElements();
                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                // If no focusable elements, focus the container itself
                if (!firstEl) {
                    containerRef.current.focus();
                    return;
                }

                const activeElement = document.activeElement as HTMLElement;
                const isActiveInContainer = containerRef.current.contains(activeElement);

                // For radio buttons, we need to find the representative element in our focusable list
                let currentIndex = focusableElements.indexOf(activeElement);

                // If the active element is not in our focusable list but is a radio button,
                // find its representative in the focusable list
                if (currentIndex === -1 && activeElement instanceof HTMLInputElement && activeElement.type === 'radio') {
                    const radioName = activeElement.name || `__unnamed_${activeElement.id || Math.random()}`;
                    currentIndex = focusableElements.findIndex(el =>
                        el instanceof HTMLInputElement &&
                        el.type === 'radio' &&
                        (el.name || `__unnamed_${el.id || Math.random()}`) === radioName
                    );
                }

                // If focus is outside the container or not found, move to first/last element
                if (!isActiveInContainer || currentIndex === -1) {
                    if (e.shiftKey) {
                        focusElementWithScroll(lastEl);
                    } else {
                        focusElementWithScroll(firstEl);
                    }
                    return;
                }

                // Move focus to previous/next element in the trap
                if (e.shiftKey) {
                    // Shift+Tab: Move to previous element (wrap to last if at first)
                    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
                    focusElementWithScroll(focusableElements[prevIndex]);
                } else {
                    // Tab: Move to next element (wrap to first if at last)
                    const nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
                    focusElementWithScroll(focusableElements[nextIndex]);
                }
                return;
            }

            // ARROW KEY NAVIGATION: Handle arrow keys for custom navigation (if enabled)
            if (
                (navigationMode === 'arrow' || navigationMode === 'both') &&
                ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
            ) {
                const activeElement = document.activeElement as HTMLElement;

                // Check if the current element should handle its own arrow keys for this specific key
                if (activeElement && shouldElementHandleOwnArrows(activeElement, e.key)) {
                    // For text inputs and textareas, let them handle left/right arrows for cursor movement
                    // but we handle up/down arrows for navigation
                    return;
                }

                // WE HANDLE THE ARROW KEYS: Prevent default and manage focus ourselves
                e.preventDefault();
                const focusableElements = getFocusableElements();
                const firstEl = focusableElements[0];
                const lastEl = focusableElements[focusableElements.length - 1];

                if (!firstEl) return;

                const isActiveInContainer = containerRef.current.contains(activeElement);
                let currentIndex = focusableElements.indexOf(activeElement);

                // For radio buttons, find the representative element in our focusable list
                if (currentIndex === -1 && activeElement instanceof HTMLInputElement && activeElement.type === 'radio') {
                    const radioName = activeElement.name || `__unnamed_${activeElement.id || Math.random()}`;
                    currentIndex = focusableElements.findIndex(el =>
                        el instanceof HTMLInputElement &&
                        el.type === 'radio' &&
                        (el.name || `__unnamed_${el.id || Math.random()}`) === radioName
                    );
                }

                // Handle Right/Down arrows (next element)
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    if (!isActiveInContainer || currentIndex === -1) {
                        focusElementWithScroll(firstEl);
                    } else {
                        const nextIndex = (currentIndex + 1) % focusableElements.length;
                        focusElementWithScroll(focusableElements[nextIndex]);
                    }
                }

                // Handle Left/Up arrows (previous element)
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    if (!isActiveInContainer || currentIndex === -1) {
                        focusElementWithScroll(lastEl);
                    } else {
                        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
                        focusElementWithScroll(focusableElements[prevIndex]);
                    }
                }
                return;
            }

            // ESCAPE KEY: Allow components to handle escape (close dialogs, etc.)
            if (e.key === "Escape" && onEscape) {
                e.preventDefault();
                onEscape();
            }
        },
        [enabled, onEscape, containerRef, navigationMode, trackInputMethod, getFocusableElements, shouldElementHandleOwnArrows, focusElementWithScroll]
    );

    /**
     * Handles mouse interactions for tracking input method
     * This helps differentiate between keyboard and mouse users for accessibility
     */
    const handleMouseInteraction = useCallback(
        (targetElement: HTMLElement) => {
            if (trackInputMethod) {
                setIsUsingKeyboard(false);
                isKeyboardNavigatingRef.current = false;
                // Focus the element if it's not already focused and is focusable
                if (document.activeElement !== targetElement && targetElement.tabIndex !== -1) {
                    targetElement.focus({ preventScroll: true });
                }
            }
        },
        [trackInputMethod]
    );

    /**
     * Register/unregister with focus trap manager
     */
    useEffect(() => {
        if (!enabled) {
            if (modalIdRef.current) {
                unregisterFocusTrap(modalIdRef.current);
                modalIdRef.current = null;
            }
            return;
        }

        modalIdRef.current = registerFocusTrap(containerRef, handleFocusIn);

        return () => {
            if (modalIdRef.current) {
                const wasTop = isTopModal(modalIdRef.current);
                unregisterFocusTrap(modalIdRef.current);

                //  Restore previous focus only if we were the top modal
                if (
                    wasTop &&
                    previousFocusRef.current &&
                    openedWithKeyboardRef.current
                ) {
                    previousFocusRef.current.focus();
                }

                modalIdRef.current = null;
            }
        };
    }, [enabled, handleFocusIn, containerRef, isUsingKeyboard]);
    /**
     * SET UP MOUSE EVENT LISTENERS
     * These track mouse interactions to determine input method (keyboard vs mouse)
     */
    useEffect(() => {
        if (!enabled || !trackInputMethod || !containerRef.current) return;

        const container = containerRef.current;

        const handleMouseEnter = (e: MouseEvent) => {
            // Only process if not in keyboard navigation mode
            if (isKeyboardNavigatingRef.current) {
                return;
            }
            const target = e.target as Node;
            const focusableElements = getFocusableElements();
            const focusableTarget = focusableElements.find(el => el === target || el.contains(target));
            if (focusableTarget) {
                handleMouseInteraction(focusableTarget);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            const focusableElements = getFocusableElements();
            const focusableTarget = focusableElements.find(el => el === target || el.contains(target));
            if (focusableTarget) {
                handleMouseInteraction(focusableTarget);
            }
        };

        // Add mouse move handler to detect intentional mouse movement
        const handleMouseMove = (e: MouseEvent) => {
            // Only reset keyboard navigation on significant mouse movement
            if (isKeyboardNavigatingRef.current) {
                const moveThreshold = 2; // pixels
                if (Math.abs(e.movementX) > moveThreshold || Math.abs(e.movementY) > moveThreshold) {
                    isKeyboardNavigatingRef.current = false;
                }
            }
        };

        container.addEventListener("mouseenter", handleMouseEnter, true);
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mousemove", handleMouseMove);

        return () => {
            container.removeEventListener("mouseenter", handleMouseEnter, true);
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mousemove", handleMouseMove);
        };
    }, [enabled, trackInputMethod, containerRef, handleMouseInteraction, getFocusableElements]);

    /**
     * SET UP KEYBOARD EVENT LISTENERS AND CONTAINER ATTRIBUTES
     * This is the main setup for the focus trap functionality
     */
    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const container = containerRef.current;

        // Make the container focusable so we can trap focus inside it
        if (!container.hasAttribute("tabindex")) {
            container.setAttribute("tabindex", "-1");
        }

        // Only focus the container if nothing inside it is already focused
        // This prevents stealing focus from elements that are already focused (like radio buttons)
        if (!container.contains(document.activeElement)) {
            container.focus({ preventScroll: true });
        }

        // Listen for keyboard events on the container
        container.addEventListener("keydown", handleKeyDown);

        return () => {
            container.removeEventListener("keydown", handleKeyDown);
        };
    }, [enabled, handleKeyDown, containerRef]);

    /**
     * REMEMBER PREVIOUS FOCUS
     * When the focus trap is enabled, remember what was focused before
     * When it's disabled, restore focus to the previous element
     * Now respects modal stacking for better focus restoration
     */
    useLayoutEffect(() => {
        if (!enabled) return;
        previousFocusRef.current = document.activeElement as HTMLElement;
        // check if the thing that opened the modal got focus via keyboard
        const ae = document.activeElement as HTMLElement | null;
        if (ae) {
            // if it was focused via Tab/Enter/Space, it will already be :focus-visible
            openedWithKeyboardRef.current = ae.matches(":focus-visible");
        }

    }, [enabled]);


    /**
     * SET UP DOM MUTATION OBSERVER
     * This watches for changes in the DOM to keep our focusable elements list current
     * Separated from focus management to prevent unnecessary re-focusing
     */
    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        // Initial update of focusable elements
        updateFocusableElements();

        // Watch for DOM changes that might affect focusable elements
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(containerRef.current, {
            childList: true,           // Watch for added/removed elements
            subtree: true,             // Watch the entire subtree
            attributes: true,          // Watch for attribute changes
            attributeFilter: ['disabled', 'tabindex', 'checked', 'name'] // Watch relevant attributes including radio-specific ones
        });

        return () => observer.disconnect();
    }, [enabled, containerRef, updateFocusableElements]);

    /**
     * INITIAL FOCUS SETUP
     * Set focus to the specified element or first focusable element when the trap is enabled
     */
    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const focusableElements = getFocusableElements();


        if (typeof initialFocusIndex === "number") {

            // Use the specified initial focus index
            if (initialFocusIndex >= 0 && initialFocusIndex < focusableElements.length) {
                focusElementWithScroll(focusableElements[initialFocusIndex]);
            } else if (focusableElements.length > 0) {

                containerRef.current.focus();
            }
        } else {
            // No focusable elements, focus the container
            containerRef.current.focus();
        }

    }, [enabled, initialFocusIndex, getFocusableElements, containerRef, focusElementWithScroll]);

    // Return keyboard tracking state if requested, otherwise return nothing
    return trackInputMethod ? { isUsingKeyboard } : undefined;
}
