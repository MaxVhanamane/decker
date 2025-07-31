import { HighlightColors } from "../../../types/textEditorTypes";

export const highlightStylePlain = {
    red: "bg-red-100 dark:bg-red-500/40",
    blue: "bg-blue-100 dark:bg-blue-500/40",
    yellow: "bg-yellow-100 dark:bg-yellow-400/50",
    purple: "bg-purple-100 dark:bg-purple-500/40",
    green: "bg-green-100 dark:bg-green-500/40",
    teal: "bg-teal-100 dark:bg-teal-500/40",
    pink: "bg-pink-100 dark:bg-pink-500/40",
    sky: "bg-sky-100 dark:bg-sky-500/40",
};
export const highlightStyleWavy = {
    red: "bg-transparent [background-image:linear-gradient(103deg,rgba(255,0,0,0.12)_0%,rgba(255,0,0,0.6)_7%,rgba(255,0,0,0.35)_22%,rgba(255,0,0,0.55)_38%,rgba(255,0,0,0.3)_63%,rgba(255,0,0,0.5)_85%,rgba(255,0,0,0.15)_100%)]",
    blue: "bg-transparent [background-image:linear-gradient(106deg,rgba(0,0,255,0.1)_0%,rgba(0,0,255,0.5)_10%,rgba(0,0,255,0.35)_35%,rgba(0,0,255,0.6)_60%,rgba(0,0,255,0.3)_85%,rgba(0,0,255,0.2)_100%)]",
    yellow:
        "bg-transparent [background-image:linear-gradient(104deg,rgba(255,225,0,0.1)_0%,rgba(255,225,0,0.6)_10%,rgba(255,225,0,0.3)_45%,rgba(255,225,0,0.55)_70%,rgba(255,225,0,0.2)_100%)]",
    purple:
        "bg-transparent [background-image:linear-gradient(102deg,rgba(128,0,128,0.12)_0%,rgba(128,0,128,0.55)_8%,rgba(128,0,128,0.4)_30%,rgba(128,0,128,0.6)_65%,rgba(128,0,128,0.25)_100%)]",
    green:
        "bg-transparent [background-image:linear-gradient(107deg,rgba(0,128,0,0.12)_0%,rgba(0,128,0,0.6)_15%,rgba(0,128,0,0.4)_40%,rgba(0,128,0,0.55)_75%,rgba(0,128,0,0.2)_100%)]",
    teal: "bg-transparent [background-image:linear-gradient(103deg,rgba(0,128,128,0.1)_0%,rgba(0,128,128,0.5)_10%,rgba(0,128,128,0.35)_45%,rgba(0,128,128,0.6)_80%,rgba(0,128,128,0.15)_100%)]",
    pink: "bg-transparent [background-image:linear-gradient(108deg,rgba(255,192,203,0.12)_0%,rgba(255,192,203,0.5)_12%,rgba(255,192,203,0.3)_38%,rgba(255,192,203,0.55)_70%,rgba(255,192,203,0.18)_100%)]",
    sky: "bg-transparent [background-image:linear-gradient(105deg,rgba(135,206,235,0.12)_0%,rgba(135,206,235,0.55)_8%,rgba(135,206,235,0.35)_40%,rgba(135,206,235,0.6)_75%,rgba(135,206,235,0.2)_100%)]",
};


export const highlightColorOptions: {
    color: HighlightColors;
    toolTipPosition: "top" | "right" | "bottom" | "left";
    backgroundColor: string;
    backgroundColorWavy: string;
}[] = [
        {
            color: "sky",
            toolTipPosition: "left",
            backgroundColor: "bg-sky-200 dark:bg-sky-500/40",
            backgroundColorWavy: highlightStyleWavy["sky"],
        },
        {
            color: "yellow",
            toolTipPosition: "right",
            backgroundColor: "bg-yellow-200 dark:bg-yellow-400/50",
            backgroundColorWavy: highlightStyleWavy["yellow"],
        },
        {
            color: "purple",
            toolTipPosition: "left",
            backgroundColor: "bg-purple-200 dark:bg-purple-500/40",
            backgroundColorWavy: highlightStyleWavy["purple"],
        },
        {
            color: "green",
            toolTipPosition: "right",
            backgroundColor: "bg-green-200 dark:bg-green-500/40",
            backgroundColorWavy: highlightStyleWavy["green"],
        },
        {
            color: "teal",
            toolTipPosition: "left",
            backgroundColor: "bg-teal-200 dark:bg-teal-500/40",
            backgroundColorWavy: highlightStyleWavy["teal"],
        },
        {
            color: "red",
            toolTipPosition: "right",
            backgroundColor: "bg-red-200 dark:bg-red-500/40",
            backgroundColorWavy: highlightStyleWavy["red"],
        },
        {
            color: "pink",
            toolTipPosition: "left",
            backgroundColor: "bg-pink-200 dark:bg-pink-500/40",
            backgroundColorWavy: highlightStyleWavy["pink"],
        },
        {
            color: "blue",
            toolTipPosition: "right",
            backgroundColor: "bg-blue-200 dark:bg-blue-500/40",
            backgroundColorWavy: highlightStyleWavy["blue"],
        },
    ];
