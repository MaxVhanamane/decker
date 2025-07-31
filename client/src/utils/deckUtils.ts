type DeckSkeletonCounts = {
    pinned: number;
    others: number;
};

export const getDeckSkeletonCounts = (): DeckSkeletonCounts | null => {
    try {
        const item = localStorage.getItem("DeckSkeletonCounts");
        if (!item) return null;

        const parsed = JSON.parse(item);

        // Type check (basic)
        if (
            typeof parsed === "object" &&
            typeof parsed.pinned === "number" &&
            typeof parsed.others === "number"
        ) {
            return parsed as DeckSkeletonCounts;
        }

        return null;
    } catch {
        return null;
    }
};
