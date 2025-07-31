// import { v4 as uuidv4 } from 'uuid';
// import { DeckWithCardsType } from "../src/types/types";


// export const updateCache = (action: string, cacheName: string, urlValue: string, data: any) => {


//     const url = `${import.meta.env.VITE_API_URL}/${urlValue}`;

//     // Open the cache
//     // I don't have to create a new reference here for updating as I am not updating/setting the state; I can directly manipulate the cached data.
//     caches.open(cacheName).then(async (cache) => {
//         // get the data from cache
//         const cachedResponse = await cache.match(url);
//         if (cachedResponse) {
//             // Clone the response to modify it
//             const modifiedResponse = cachedResponse.clone();

//             if (action === "getuser") {
//                 // Create a new response with updated body and original properties
//                 const updatedResponse = new Response(JSON.stringify({ message: "Your session has expired. Please log in again to continue." }), {
//                     status: 401,
//                     statusText: "Unauthorized",
//                     headers: modifiedResponse.headers,
//                 });

//                 // Update the modified response in the cache
//                 cache.put(url, updatedResponse);
//                 return
//             }


//             const responseBody: DeckWithCardsType[] = await cachedResponse.json();
//             let updatedBodyContent: DeckWithCardsType[] = []




//             switch (action) {
//                 case "createCard": {
//                     // If you look at the _id of an individual card once it is created, you will notice that the _id value is different in ["decks-and-cards"] and in individual deck ["cards", deckId], which is fine because I generate it temporarily and I do not use it anywhere in the app. Instead, I use cardId, which is the same in both cases.
//                     updatedBodyContent = responseBody?.map((deck) => {
//                         if (deck?.deckId === data?.deckId) {
//                             const newArray = [...deck.cards];
//                             newArray.unshift({
//                                 ...data.content,
//                                 _id: uuidv4(),
//                             });
//                             return { ...deck, cards: newArray };
//                         } else {
//                             return deck;
//                         }
//                     })
//                     break
//                 }

//                 case "deleteCard": {

//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck.deckId === data.deckId) {
//                             const updatedCards = [...deck.cards]; // Create a new reference for obj.cards

//                             updatedCards.splice(data.index, 1);
//                             // Return a new object with the updated cards
//                             return { ...deck, cards: updatedCards };
//                         } else {
//                             return deck;
//                         }
//                     });
//                     break
//                 }
//                 case "moveCard": {
//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck?.deckId === data?.deckId) {
//                             const newCardsArray = [...deck.cards];
//                             let element_to_move = newCardsArray.splice(
//                                 data.deleteIndex,
//                                 1
//                             )[0];
//                             newCardsArray.splice(data.moveIndex, 0, element_to_move);
//                             return { ...deck, cards: newCardsArray };
//                         } else {
//                             return deck;
//                         }
//                     })

//                     break
//                 }
//                 case "undoCard": {
//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck?.deckId === data?.deckId) {
//                             const newArray = [...deck.cards];
//                             // As the server generates a new _id when undoing the card, we will add a temporary _id during optimistic updates.
//                             newArray.splice(data.index, 0, {
//                                 ...data.content,
//                             });
//                             return { ...deck, cards: newArray };
//                         } else {
//                             return deck;
//                         }
//                     });
//                     break
//                 }

//                 case "editCard": {
//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck?.deckId === data.deckId) {
//                             const updatedCards = [...deck.cards];
//                             updatedCards?.splice(data?.index, 1, data?.newContent);
//                             deck.cards = updatedCards;
//                             return deck;
//                         } else {
//                             return deck;
//                         }
//                     });
//                     break
//                 }
//                 case "createDeck": {
//                     updatedBodyContent = [{
//                         deckId: data?.deckId,
//                         title: data?.title,
//                         cards: [],
//                         pinned: false,
//                         createdAt: data?.createdAt
//                     }, ...responseBody]
//                     break
//                 }
//                 case "deleteDeck": {
//                     updatedBodyContent = responseBody.filter((deck) => {
//                         return deck?.deckId !== data?.deckId
//                     });
//                     break
//                 }
//                 case "editDeck": {
//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck.deckId === data?.deckId) {
//                             return { ...deck, title: data?.newTitle };
//                         }
//                         return deck;
//                     });
//                     break
//                 }
//                 case "undoDeck": {
//                     const newArray = [...responseBody]
//                     newArray.splice(data.index, 0, {
//                         deckId: data?.deckId,
//                         title: data?.title,
//                         pinned: data?.pinned,
//                         cards: data?.cards,
//                         createdAt: data?.createdAt
//                     });
//                     updatedBodyContent = newArray
//                     break
//                 }
//                 case "pinDeck": {
//                     const index = responseBody.findIndex(deck => deck?.deckId === data?.id)
//                     if (index !== -1) {
//                         responseBody[index].pinned = data.pinned
//                         const [objectToBeMoved] = responseBody.splice(index, 1)
//                         responseBody.unshift(objectToBeMoved)
//                     }
//                     updatedBodyContent = responseBody
//                     break
//                 }
//                 case "getUser": {

//                     updatedBodyContent = responseBody.map((deck) => {
//                         if (deck.deckId === data.deckId) {
//                             const updatedCards = [...deck.cards]; // Create a new reference for obj.cards

//                             updatedCards.splice(data.index, 1);
//                             // Return a new object with the updated cards
//                             return { ...deck, cards: updatedCards };
//                         } else {
//                             return deck;
//                         }
//                     });
//                     break
//                 }

//             }


//             // Create a new response with updated body and original properties
//             const updatedResponse = new Response(JSON.stringify(updatedBodyContent), {
//                 status: modifiedResponse.status,
//                 statusText: modifiedResponse.statusText,
//                 headers: modifiedResponse.headers,
//             });

//             // Update the modified response in the cache
//             cache.put(url, updatedResponse);
//         }
//     });
// }

