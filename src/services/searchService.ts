import mongoose from 'mongoose';
import DeckModel from '../models/deck';
import { CardModel } from '../models/card';

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
    note: { children: any[]; type?: string | null | undefined }[];
    createdAt: Date;
    order: number;
};

export type ChapterCardSearchResult = {
    type: 'chapter-card';
    deckId: string;
    deckTitle: string;
    chapterId: string;
    chapterTitle: string;
    cardId: string;
    note: { children: any[]; type?: string | null | undefined }[];
    createdAt: Date;
    order: number;
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

// ---- Lean shapes we actually select from Mongo ----
type LeanChapter = {
    chapterId: string;
    chapterTitle?: string;
    createdAt: Date;
};

type LeanDeck = {
    deckId: string;
    title?: string;
    pinned: boolean;
    createdAt: Date;
    cardsCount?: number;
    chapters?: LeanChapter[];
};

type LeanCard = {
    cardId: string;
    searchableContent?: string;
    note: { children: any[]; type?: string | null | undefined }[];
    createdAt: Date;
    deckId: string;
    chapterId?: string | null;
    order: number;
};

// Escape user input for regex
function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class SearchService {
    static async search(
        query: string,
        userId: mongoose.Types.ObjectId,
        page: number = 1,
        limit: number = 20
    ): Promise<SearchResponse> {
        const skip = (page - 1) * limit;
        const clean = escapeRegex(query.replace(/['"]+/g, ''));
        const searchRegex = new RegExp(clean, 'i');

        const allResults: SearchResult[] = [];

        // 1) Load all decks for this user (not deleted)
        const deckDocs = await DeckModel.find(
            { email: userId, deletedAt: { $exists: false } },
            { deckId: 1, title: 1, pinned: 1, createdAt: 1, cardsCount: 1, chapters: 1, _id: 0 }
        )
            .lean<LeanDeck[]>()
            .exec();

        // Build maps for quick lookups
        const deckMap = new Map<string, LeanDeck>();
        const deckIds: string[] = [];

        for (const d of deckDocs) {
            if (!d?.deckId) continue;
            deckMap.set(d.deckId, d);
            deckIds.push(d.deckId);

            // Deck title match
            if (d.title && searchRegex.test(d.title)) {
                allResults.push({
                    type: 'deck',
                    deckId: d.deckId,
                    title: d.title,
                    pinned: d.pinned,
                    createdAt: d.createdAt,
                    cardsCount: d.cardsCount ?? 0,
                });
            }

            // Chapter title match
            if (Array.isArray(d.chapters)) {
                for (const ch of d.chapters) {
                    if (ch?.chapterId && ch.chapterTitle && searchRegex.test(ch.chapterTitle)) {
                        allResults.push({
                            type: 'chapter',
                            deckId: d.deckId,
                            deckTitle: d.title ?? '',
                            chapterId: ch.chapterId,
                            chapterTitle: ch.chapterTitle,
                            createdAt: ch.createdAt,
                        });
                    }
                }
            }
        }

        if (deckIds.length === 0) {
            // No decks for this user -> empty results
            return {
                results: [],
                total: 0,
                page,
                totalPages: 0,
                hasMore: false,
            };
        }

        // 2) Load cards from the separate collection, for those decks, matching the regex
        const cardDocs = await CardModel.find(
            { deckId: { $in: deckIds }, searchableContent: searchRegex },
            { cardId: 1, note: 1, createdAt: 1, deckId: 1, chapterId: 1, order: 1, _id: 0 }
        )
            .lean<LeanCard[]>()
            .exec();

        // Optional: Build chapter lookup per deck for nicer labels
        const chapterTitleMap = new Map<string, Map<string, { title: string; createdAt: Date }>>();
        for (const d of deckDocs) {
            if (!d.chapters?.length) continue;
            const inner = new Map<string, { title: string; createdAt: Date }>();
            for (const ch of d.chapters) {
                if (ch.chapterId) {
                    inner.set(ch.chapterId, { title: ch.chapterTitle ?? '', createdAt: ch.createdAt });
                }
            }
            chapterTitleMap.set(d.deckId, inner);
        }

        // 3) Convert cards to results
        for (const c of cardDocs) {
            const deck = deckMap.get(c.deckId);
            if (!deck) continue;

            if (c.chapterId) {
                const chMap = chapterTitleMap.get(c.deckId);
                const chInfo = chMap?.get(c.chapterId);
                allResults.push({
                    type: 'chapter-card',
                    deckId: deck.deckId,
                    deckTitle: deck.title ?? '',
                    chapterId: c.chapterId,
                    chapterTitle: chInfo?.title ?? '',
                    cardId: c.cardId,
                    note: c.note,
                    createdAt: c.createdAt,
                    order: c.order,
                });
            } else {
                allResults.push({
                    type: 'deck-card',
                    deckId: deck.deckId,
                    deckTitle: deck.title ?? '',
                    cardId: c.cardId,
                    note: c.note,
                    createdAt: c.createdAt,
                    order: c.order,
                });
            }
        }

        // 4) Sort by deck,chapter,deck-card,chapter-card
        const typeOrder: Record<SearchResult['type'], number> = {
            deck: 0,
            chapter: 1,
            'deck-card': 2,
            'chapter-card': 3,
        };
        allResults.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

        // 5) Paginate
        const total = allResults.length;
        const paginated = allResults.slice(skip, skip + limit);

        return {
            results: paginated,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit),
        };
    }
}
