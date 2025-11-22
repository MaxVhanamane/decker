import { useEffect } from "react";
import { Editor } from "slate";
import { ReactEditor } from "slate-react";

export function useGlobalEditorShortcuts(editor: Editor, options?: { onEditorFocus: () => void }) {
    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            // Focus toolbar
            if (event.key.toLowerCase() === "t" && event.altKey) {
                event.preventDefault();

                function focusFirstFocusable() {
                    const firstToolbarButton = document.querySelector<HTMLElement>(
                        "[data-toolbar-container]"
                    );
                    if (!firstToolbarButton) return;

                    const focusableSelectors = "button:not([disabled])";

                    const firstFocusable =
                        firstToolbarButton.querySelector<HTMLElement>(focusableSelectors);

                    if (firstFocusable) {
                        firstFocusable.focus();
                        firstFocusable.classList.add("keyboard-focus");

                        const handleBlur = () => {
                            firstFocusable.classList.remove("keyboard-focus");
                            firstFocusable.removeEventListener("blur", handleBlur);
                        };

                        firstFocusable.addEventListener("blur", handleBlur);
                    }

                    return;
                }
                focusFirstFocusable();
            }

            // Focus editor
            if (event.altKey && event.shiftKey && key === "e") {
                event.preventDefault();
                ReactEditor.focus(editor);
                if (options?.onEditorFocus) {
                    options?.onEditorFocus()
                }
                return;
            }

            // // Focus first card below
            // if (event.altKey && event.shiftKey && key === "c") {
            //     event.preventDefault();
            //     const firstCard = cardRef.current?.querySelector<HTMLElement>(
            //         "[data-card]"
            //     );
            //     firstCard?.focus();
            //     firstCard?.classList.add("keyboard-focus");
            //     return;
            // }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [editor]);
}
