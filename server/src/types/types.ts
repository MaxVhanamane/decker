type SimplifiedCard = {
    cardId: string;
    note: string;
    createdAt: string;
};

export type DeckProjection = {
    deckId: string;
    title: string;
    cards: SimplifiedCard[];
};
