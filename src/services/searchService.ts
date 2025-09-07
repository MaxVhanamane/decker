import mongoose from 'mongoose';
import DeckModel from '../models/deck';
import CardModel from '../models/card';
import ChapterModel from '../models/chapter';

// ---- Result types ----
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
    note: { children: any[]; type?: string | null }[];
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
    note: { children: any[]; type?: string | null }[];
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

// Escape user input for regex
function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class SearchService {
    // Optimized approach: Separate queries with proper pagination
    static async search(
        query: string,
        userId: mongoose.Types.ObjectId,
        page: number = 1,
        limit: number = 20
    ): Promise<SearchResponse> {
        const skip = (page - 1) * limit;
        const cleanQuery = escapeRegex(query.replace(/['"]+/g, ''));
        const searchRegex = new RegExp(cleanQuery, 'i');

        // First, get valid deck IDs for this user to optimize card queries
        const validDeckIds = await DeckModel.distinct('deckId', {
            email: userId,
            deletedAt: { $exists: false }
        });

        if (validDeckIds.length === 0) {
            return { results: [], total: 0, page, totalPages: 0, hasMore: false };
        }

        // Count totals for each type
        const [deckCount, chapterCount, cardCount] = await Promise.all([
            DeckModel.countDocuments({
                email: userId,
                deletedAt: { $exists: false },
                title: searchRegex
            }),
            ChapterModel.countDocuments({
                email: userId,
                deletedAt: { $exists: false },
                deckId: { $in: validDeckIds },
                chapterName: searchRegex
            }),
            CardModel.countDocuments({
                deckId: { $in: validDeckIds },
                deletedAt: { $exists: false },
                searchableContent: searchRegex
            })
        ]);

        const total = deckCount + chapterCount + cardCount;
        const totalPages = Math.ceil(total / limit);

        // Determine which types to query based on pagination
        const results: SearchResult[] = [];
        let remaining = limit;
        let currentSkip = skip;

        // Decks first (priority 0)
        if (currentSkip < deckCount && remaining > 0) {
            const deckResults = await this.getDecks(
                searchRegex,
                userId,
                Math.max(0, currentSkip),
                Math.min(remaining, deckCount - currentSkip)
            );
            results.push(...deckResults);
            remaining -= deckResults.length;
        }
        currentSkip = Math.max(0, currentSkip - deckCount);

        // Chapters second (priority 1)
        if (currentSkip < chapterCount && remaining > 0) {
            const chapterResults = await this.getChapters(
                searchRegex,
                userId,
                validDeckIds,
                Math.max(0, currentSkip),
                Math.min(remaining, chapterCount - currentSkip)
            );
            results.push(...chapterResults);
            remaining -= chapterResults.length;
        }
        currentSkip = Math.max(0, currentSkip - chapterCount);

        // Cards last (priority 2 & 3)
        if (currentSkip < cardCount && remaining > 0) {
            const cardResults = await this.getCards(
                searchRegex,
                validDeckIds,
                Math.max(0, currentSkip),
                remaining
            );
            results.push(...cardResults);
        }

        return {
            results,
            total,
            page,
            totalPages,
            hasMore: page < totalPages,
        };
    }

    private static async getDecks(
        searchRegex: RegExp,
        userId: mongoose.Types.ObjectId,
        skip: number,
        limit: number
    ): Promise<DeckSearchResult[]> {
        const decks = await DeckModel.find(
            {
                email: userId,
                deletedAt: { $exists: false },
                title: searchRegex
            },
            {
                deckId: 1,
                title: 1,
                pinned: 1,
                createdAt: 1,
                cardsCount: 1
            }
        )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return decks.map(deck => ({
            type: 'deck' as const,
            deckId: deck.deckId,
            title: deck.title || '',
            pinned: deck.pinned,
            createdAt: deck.createdAt,
            cardsCount: deck.cardsCount || 0,
        }));
    }

    private static async getChapters(
        searchRegex: RegExp,
        userId: mongoose.Types.ObjectId,
        validDeckIds: string[],
        skip: number,
        limit: number
    ): Promise<ChapterSearchResult[]> {
        const pipeline = [
            {
                $match: {
                    email: userId,
                    deletedAt: { $exists: false },
                    deckId: { $in: validDeckIds },
                    chapterName: searchRegex
                }
            },
            {
                $lookup: {
                    from: 'decks', // MongoDB collection name
                    let: { deckId: '$deckId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$deckId', '$$deckId'] },
                                email: userId,
                                deletedAt: { $exists: false }
                            }
                        },
                        { $project: { title: 1, _id: 0 } }
                    ],
                    as: 'deckInfo'
                }
            },
            {
                $project: {
                    chapterId: 1,
                    deckId: 1,
                    chapterName: 1,
                    createdAt: 1,
                    deckTitle: {
                        $ifNull: [
                            { $arrayElemAt: ['$deckInfo.title', 0] },
                            ''
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 as const } },
            { $skip: skip },
            { $limit: limit }
        ];

        const chapters = await ChapterModel.aggregate(pipeline);

        return chapters.map(chapter => ({
            type: 'chapter' as const,
            deckId: chapter.deckId,
            deckTitle: chapter.deckTitle,
            chapterId: chapter.chapterId,
            chapterTitle: chapter.chapterName,
            createdAt: chapter.createdAt,
        }));
    }

    private static async getCards(
        searchRegex: RegExp,
        validDeckIds: string[],
        skip: number,
        limit: number
    ): Promise<CardSearchResult[]> {
        const pipeline: any[] = [
            {
                $match: {
                    deckId: { $in: validDeckIds },
                    deletedAt: { $exists: false },
                    searchableContent: searchRegex
                }
            },
            {
                $lookup: {
                    from: 'decks',
                    let: { deckId: '$deckId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$deckId', '$$deckId'] },
                                deletedAt: { $exists: false }
                            }
                        },
                        { $project: { title: 1, _id: 0 } }
                    ],
                    as: 'deckInfo'
                }
            },
            {
                $lookup: {
                    from: 'chapters',
                    let: {
                        chapterId: '$chapterId',
                        deckId: '$deckId'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$chapterId', '$$chapterId'] },
                                        { $eq: ['$deckId', '$$deckId'] },
                                        { $ne: ['$chapterId', null] }
                                    ]
                                },
                                deletedAt: { $exists: false }
                            }
                        },
                        { $project: { chapterName: 1, _id: 0 } }
                    ],
                    as: 'chapterInfo'
                }
            },
            {
                $project: {
                    cardId: 1,
                    deckId: 1,
                    chapterId: 1,
                    note: 1,
                    createdAt: 1,
                    order: 1,
                    deckTitle: {
                        $ifNull: [
                            { $arrayElemAt: ['$deckInfo.title', 0] },
                            ''
                        ]
                    },
                    chapterTitle: {
                        $ifNull: [
                            { $arrayElemAt: ['$chapterInfo.chapterName', 0] },
                            ''
                        ]
                    },
                    // Add sort priority: deck-card = 2, chapter-card = 3
                    sortOrder: {
                        $cond: {
                            if: { $and: [{ $ne: ['$chapterId', null] }, { $ne: ['$chapterId', ''] }] },
                            then: 3,
                            else: 2
                        }
                    }
                }
            },
            { $sort: { sortOrder: 1 as const, createdAt: -1 as const } },
            { $skip: skip },
            { $limit: limit }
        ];

        const cards = await CardModel.aggregate(pipeline);


        return cards.map(card => {
            const baseCard = {
                deckId: card.deckId,
                deckTitle: card.deckTitle,
                cardId: card.cardId,
                note: card.note,
                createdAt: card.createdAt,
                order: card.order,
            };

            // Check if card belongs to a chapter
            if (card.chapterId && card.chapterId !== null && card.chapterId !== '') {
                return {
                    type: 'chapter-card' as const,
                    ...baseCard,
                    chapterId: card.chapterId,
                    chapterTitle: card.chapterTitle,
                };
            } else {
                return {
                    type: 'deck-card' as const,
                    ...baseCard,
                };
            }
        });
    }

    // Optional: Method to get search counts without results (useful for UI)
    static async getSearchCounts(
        query: string,
        userId: mongoose.Types.ObjectId
    ): Promise<{ decks: number; chapters: number; cards: number; total: number }> {
        const cleanQuery = escapeRegex(query.replace(/['"]+/g, ''));
        const searchRegex = new RegExp(cleanQuery, 'i');

        const validDeckIds = await DeckModel.distinct('deckId', {
            email: userId,
            deletedAt: { $exists: false }
        });

        if (validDeckIds.length === 0) {
            return { decks: 0, chapters: 0, cards: 0, total: 0 };
        }

        const [deckCount, chapterCount, cardCount] = await Promise.all([
            DeckModel.countDocuments({
                email: userId,
                deletedAt: { $exists: false },
                title: searchRegex
            }),
            ChapterModel.countDocuments({
                email: userId,
                deletedAt: { $exists: false },
                deckId: { $in: validDeckIds },
                chapterName: searchRegex
            }),
            CardModel.countDocuments({
                deckId: { $in: validDeckIds },
                deletedAt: { $exists: false },
                searchableContent: searchRegex
            })
        ]);

        return {
            decks: deckCount,
            chapters: chapterCount,
            cards: cardCount,
            total: deckCount + chapterCount + cardCount
        };
    }
}
