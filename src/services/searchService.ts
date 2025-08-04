import mongoose from 'mongoose';
import DeckModel from '../models/deck';

// Search Result Types
export type DeckSearchResult = {
    type: 'deck';
    deckId: string;
    title: string;
    pinned: boolean;
    createdAt: Date;
    cardsCount: number;
};

export type ChapterSearchResult = {
    type: 'chapter';
    deckId: string;
    deckTitle: string;
    chapterId: string;
    chapterTitle: string;
    createdAt: Date;
};

export type DeckCardSearchResult = {
    type: 'deck-card';
    deckId: string;
    deckTitle: string;
    cardId: string;
    note: {
        children: any[];
        type?: string | null | undefined;
    }[];
    createdAt: Date;
    cardIndex: number;
};

export type ChapterCardSearchResult = {
    type: 'chapter-card';
    deckId: string;
    deckTitle: string;
    chapterId: string;
    chapterTitle: string;
    cardId: string;
    note: {
        children: any[];
        type?: string | null | undefined;
    }[];
    createdAt: Date;
    cardIndex: number;
};

export type CardSearchResult = DeckCardSearchResult | ChapterCardSearchResult;
export type SearchResult = DeckSearchResult | ChapterSearchResult | CardSearchResult;

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

// Deck model types
interface Card {
    cardId: string;
    searchableContent: string;
    note: any[];
    createdAt: Date;
}

interface Chapter {
    chapterId: string;
    chapterTitle: string;
    cards: Card[];
    createdAt: Date;
}

interface Deck {
    deckId: string;
    title: string;
    cards: Card[];
    chapters: Chapter[];
    email: string;
    pinned: boolean;
    createdAt: Date;
}

export class SearchService {
    static async search(
        query: string,
        userId: mongoose.Types.ObjectId,
        page: number = 1,
        limit: number = 20
    ): Promise<SearchResponse> {
        const skip = (page - 1) * limit;
        const cleanQuery = query.replace(/['"]+/g, '');
        const searchRegex = new RegExp(cleanQuery, 'i');

        // Find matching decks
        const decks = await DeckModel.find({
            email: userId,
            deletedAt: { $exists: false },
            $or: [
                { title: searchRegex },
                { 'chapters.chapterTitle': searchRegex },
                { 'chapters.cards.searchableContent': searchRegex },
                { 'cards.searchableContent': searchRegex }
            ]
        }).lean()

        const allResults: SearchResult[] = [];

        for (const deck of decks) {
            if (!deck.deckId || !deck.title) continue;

            // Match deck
            if (searchRegex.test(deck.title)) {
                allResults.push({
                    type: 'deck',
                    deckId: deck.deckId,
                    title: deck.title,
                    pinned: deck.pinned,
                    cardsCount: deck.cards.length,
                    createdAt: deck.createdAt
                });
            }

            // Match chapters and chapter cards
            for (const chapter of deck.chapters || []) {
                if (!chapter.chapterId || !chapter.chapterTitle) continue;

                if (searchRegex.test(chapter.chapterTitle)) {
                    allResults.push({
                        type: 'chapter',
                        deckId: deck.deckId,
                        deckTitle: deck.title,
                        chapterId: chapter.chapterId,
                        chapterTitle: chapter.chapterTitle,
                        createdAt: chapter.createdAt
                    });
                }

                for (let i = 0; i < (chapter.cards || []).length; i++) {
                    const card = chapter.cards[i];
                    if (!card.cardId || !card.searchableContent) continue;

                    if (searchRegex.test(card.searchableContent)) {
                        allResults.push({
                            type: 'chapter-card',
                            deckId: deck.deckId,
                            deckTitle: deck.title,
                            chapterId: chapter.chapterId,
                            chapterTitle: chapter.chapterTitle,
                            cardId: card.cardId,
                            note: card.note,
                            createdAt: chapter.createdAt,
                            cardIndex: i
                        });
                    }
                }
            }

            // Match direct deck cards
            for (let i = 0; i < (deck.cards || []).length; i++) {
                const card = deck.cards[i];
                if (!card.cardId || !card.searchableContent) continue;

                if (searchRegex.test(card.searchableContent)) {
                    allResults.push({
                        type: 'deck-card',
                        deckId: deck.deckId,
                        deckTitle: deck.title,
                        cardId: card.cardId,
                        note: card.note,
                        createdAt: card.createdAt,
                        cardIndex: i
                    });
                }
            }
        }

        // Sort by relevance (deck > chapter > deck-card > chapter-card)
        const typeOrder = {
            deck: 0,
            chapter: 1,
            'deck-card': 2,
            'chapter-card': 3
        };

        allResults.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

        const paginatedResults = allResults.slice(skip, skip + limit);

        return {
            results: paginatedResults,
            total: allResults.length,
            page,
            totalPages: Math.ceil(allResults.length / limit),
            hasMore: page < Math.ceil(allResults.length / limit)
        };
    }
}
