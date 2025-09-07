type DeckInfo = {
    deckTitle: string;
    chapterTitle: string;
}

export const getDeckInfo = (): DeckInfo => {
    const storedDeckInfo = localStorage.getItem('currentDeckAndChapter');
    if (storedDeckInfo) {
        return JSON.parse(storedDeckInfo);
    }
    return { deckTitle: "", chapterTitle: "" };
};

export const storeDeckInfo = (deckTitle: string, chapterTitle = "") => {
    const deckInfo = {
        deckTitle,
        chapterTitle
    };
    localStorage.setItem('currentDeckAndChapter', JSON.stringify(deckInfo));
};
