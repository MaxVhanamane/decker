
// type ModalKeys = "confirmCloseCardModal" | "confirmDeleteCardModal";

// type ModalState = {
//     show: boolean;
//     startClosingModalAnimation: boolean;
// };

// type State = Record<ModalKeys, ModalState>;

// type Action =
//     | { type: "OPEN_MODAL"; modalKey: ModalKeys }
//     | { type: "CLOSE_MODAL"; modalKey: ModalKeys }


// const initialState: State = {
//     confirmCloseCardModal: {
//         show: false,
//         startClosingModalAnimation: false,
//     },
//     confirmDeleteCardModal: {
//         show: false,
//         startClosingModalAnimation: false,
//     },
// };

// function modalReducer(state: State, action: Action): State {
//     switch (action.type) {
//         case "OPEN_MODAL":
//             return {
//                 ...state,
//                 [action.modalKey]: {
//                     show: true,
//                     startClosingModalAnimation: false,
//                 },
//             };
//         case "CLOSE_MODAL":
//             return {
//                 ...state,
//                 [action.modalKey]: {
//                     ...state[action.modalKey],
//                     show: false,
//                     startClosingModalAnimation: false,
//                 },
//             };

//         default:
//             return state;
//     }
// }
