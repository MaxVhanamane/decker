// import { useEffect, useRef, useState } from "react";
// import useGetCards from "./useGetCards"; // Assuming this is a react-query hook

// type FetchReason =
//   | "key-change"
//   | "invalidation"
//   | "background-refetch"
//   | "initial-fetch"
//   | null;

// export default function useGetCardsWithReason(deckId: string, page: number) {
//   const [fetchReason, setFetchReason] = useState<FetchReason>(null);
//   const prevParamsRef = useRef({ deckId, page });
//   // This ref tracks if the query has ever successfully fetched data
//   // which helps distinguish initial loading from subsequent refetches.
//   const hasFetchedDataRef = useRef(false);

//   const query = useGetCards(deckId, page);

//   useEffect(() => {
//     const paramsChanged =
//       prevParamsRef.current.deckId !== deckId ||
//       prevParamsRef.current.page !== page;

//     if (query.isFetching) {
//       // 1. Initial Fetch: This happens when the query first starts fetching
//       //    and no data has been fetched yet (or it's the very first time).
//       //    `query.isLoading` is true when `status === 'loading'`.
//       //    `!hasFetchedDataRef.current` ensures it's the *first* time.
//       if (query.isLoading && !hasFetchedDataRef.current) {
//         setFetchReason("initial-fetch");
//       }
//       // 2. Key Change: If params changed and it's fetching, it's a key change.
//       //    This check should come after initial fetch, as initial fetch can also
//       //    be seen as a "key change" if parameters are dynamic from the start.
//       else if (paramsChanged) {
//         setFetchReason("key-change");
//       }
//       // 3. Invalidation/Manual Refetch: `isRefetching` is true when
//       //    `invalidateQueries` or `query.refetch()` is called.
//       //    It implies an explicit request to refresh data.
//       else if (query.isRefetching) {
//         setFetchReason("invalidation");
//       }
//       // 4. Background Refetch: If it's fetching, not initial, not a key change,
//       //    and not an explicit refetch via `isRefetching`, then it's most likely
//       //    a background refetch (e.g., staleTime expiry + window focus).
//       //    `query.data !== undefined` implies there was previous data.
//       else if (query.data !== undefined) {
//         setFetchReason("background-refetch");
//       }
//     } else {
//       // When not fetching, clear the reason.
//       setFetchReason(null);
//     }

//     // Update `hasFetchedDataRef` when data is successfully loaded.
//     // This helps distinguish initial load from subsequent fetches.
//     if (query.isSuccess) {
//       hasFetchedDataRef.current = true;
//     }

//     // Update ref only when params actually change for the next comparison
//     if (paramsChanged) {
//       prevParamsRef.current = { deckId, page };
//     }
//   }, [
//     query.isFetching,
//     query.isLoading, // Added for clarity, though `query.status === 'loading'` is similar
//     query.isRefetching,
//     query.isSuccess, // Added to update hasFetchedDataRef
//     query.data, // Important for the background-refetch check
//     deckId,
//     page,
//   ]);

//   return {
//     ...query,
//     fetchReason,
//     isFetchingCards: query.isFetching, // Provides a more specific name for clarity
//   };
// }
