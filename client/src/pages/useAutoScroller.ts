// import { useCallback, useEffect, useMemo, useRef } from 'react';
// import { useInterval, useLazyMemo, usePrevious } from '@dnd-kit/utilities';
// import type { Coordinates } from '@dnd-kit/utilities';

// export type { Coordinates };
// export enum Direction {
//     Forward = 1,
//     Backward = -1,
// }
// export type DistanceMeasurement =
//     | number
//     | Coordinates
//     | Pick<Coordinates, 'x'>
//     | Pick<Coordinates, 'y'>;

// export type Translate = Coordinates;

// export interface ScrollCoordinates {
//     initial: Coordinates;
//     current: Coordinates;
//     delta: Coordinates;
// }

// export type ScrollAncestorSortingFn = (ancestors: Element[]) => Element[];

// export enum AutoScrollActivator {
//     Pointer,
//     DraggableRect,
// }

// export interface Options {
//     acceleration?: number;
//     activator?: AutoScrollActivator;
//     canScroll?: CanScroll;
//     enabled?: boolean;
//     interval?: number;
//     layoutShiftCompensation?:
//     | boolean
//     | {
//         x: boolean;
//         y: boolean;
//     };
//     order?: TraversalOrder;
//     threshold?: {
//         x: number;
//         y: number;
//     };
// }

// interface Arguments extends Options {
//     draggingRect: ClientRect | null;
//     enabled: boolean;
//     pointerCoordinates: Coordinates | null;
//     scrollableAncestors: Element[];
//     scrollableAncestorRects: ClientRect[];
//     delta: Coordinates;
// }

// export type CanScroll = (element: Element) => boolean;

// export enum TraversalOrder {
//     TreeOrder,
//     ReversedTreeOrder,
// }

// interface ScrollDirection {
//     x: 0 | Direction;
//     y: 0 | Direction;
// }

// export function useAutoScroller({
//     acceleration,
//     activator = AutoScrollActivator.Pointer,
//     canScroll,
//     draggingRect,
//     enabled,
//     interval = 5,
//     order = TraversalOrder.TreeOrder,
//     pointerCoordinates,
//     scrollableAncestors,
//     scrollableAncestorRects,
//     delta,
//     threshold,
// }: Arguments) {
//     const scrollIntent = useScrollIntent({ delta, disabled: !enabled });
//     const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
//     const scrollSpeed = useRef<Coordinates>({ x: 0, y: 0 });
//     const scrollDirection = useRef<ScrollDirection>({ x: 0, y: 0 });
//     const rect = useMemo(() => {
//         switch (activator) {
//             case AutoScrollActivator.Pointer:
//                 return pointerCoordinates
//                     ? {
//                         top: pointerCoordinates.y,
//                         bottom: pointerCoordinates.y,
//                         left: pointerCoordinates.x,
//                         right: pointerCoordinates.x,
//                     }
//                     : null;
//             case AutoScrollActivator.DraggableRect:
//                 return draggingRect;
//         }
//     }, [activator, draggingRect, pointerCoordinates]);
//     const scrollContainerRef = useRef<Element | null>(null);
//     const autoScroll = useCallback(() => {
//         const scrollContainer = scrollContainerRef.current;

//         if (!scrollContainer) {
//             return;
//         }

//         const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
//         const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;

//         scrollContainer.scrollBy(scrollLeft, scrollTop);
//     }, []);
//     const sortedScrollableAncestors = useMemo(
//         () =>
//             order === TraversalOrder.TreeOrder
//                 ? [...scrollableAncestors].reverse()
//                 : scrollableAncestors,
//         [order, scrollableAncestors]
//     );

//     useEffect(
//         () => {
//             if (!enabled || !scrollableAncestors.length || !rect) {
//                 clearAutoScrollInterval();
//                 return;
//             }

//             for (const scrollContainer of sortedScrollableAncestors) {
//                 if (canScroll?.(scrollContainer) === false) {
//                     continue;
//                 }

//                 const index = scrollableAncestors.indexOf(scrollContainer);
//                 const scrollContainerRect = scrollableAncestorRects[index];

//                 if (!scrollContainerRect) {
//                     continue;
//                 }

//                 const { direction, speed } = getScrollDirectionAndSpeed(
//                     scrollContainer,
//                     scrollContainerRect,
//                     rect,
//                     acceleration,
//                     threshold
//                 );

//                 for (const axis of ['x', 'y'] as const) {
//                     if (!scrollIntent[axis][direction[axis] as Direction]) {
//                         speed[axis] = 0;
//                         direction[axis] = 0;
//                     }
//                 }

//                 if (speed.x > 0 || speed.y > 0) {
//                     clearAutoScrollInterval();

//                     scrollContainerRef.current = scrollContainer;
//                     setAutoScrollInterval(autoScroll, interval);

//                     scrollSpeed.current = speed;
//                     scrollDirection.current = direction;

//                     return;
//                 }
//             }

//             scrollSpeed.current = { x: 0, y: 0 };
//             scrollDirection.current = { x: 0, y: 0 };
//             clearAutoScrollInterval();
//         },
//         [
//             acceleration,
//             autoScroll,
//             canScroll,
//             clearAutoScrollInterval,
//             enabled,
//             interval,
//             JSON.stringify(rect),
//             JSON.stringify(scrollIntent),
//             setAutoScrollInterval,
//             scrollableAncestors,
//             sortedScrollableAncestors,
//             scrollableAncestorRects,
//             JSON.stringify(threshold),
//         ]
//     );
// }

// interface ScrollIntent {
//     x: Record<Direction, boolean>;
//     y: Record<Direction, boolean>;
// }

// const defaultScrollIntent: ScrollIntent = {
//     x: { [Direction.Backward]: false, [Direction.Forward]: false },
//     y: { [Direction.Backward]: false, [Direction.Forward]: false },
// };

// function useScrollIntent({
//     delta,
//     disabled,
// }: {
//     delta: Coordinates;
//     disabled: boolean;
// }): ScrollIntent {
//     const previousDelta = usePrevious(delta);

//     return useLazyMemo<ScrollIntent>(
//         (previousIntent) => {
//             if (disabled || !previousDelta || !previousIntent) {
//                 // Reset scroll intent tracking when auto-scrolling is disabled
//                 return defaultScrollIntent;
//             }

//             const direction = {
//                 x: Math.sign(delta.x - previousDelta.x),
//                 y: Math.sign(delta.y - previousDelta.y),
//             };

//             // Keep track of the user intent to scroll in each direction for both axis
//             return {
//                 x: {
//                     [Direction.Backward]:
//                         previousIntent.x[Direction.Backward] || direction.x === -1,
//                     [Direction.Forward]:
//                         previousIntent.x[Direction.Forward] || direction.x === 1,
//                 },
//                 y: {
//                     [Direction.Backward]:
//                         previousIntent.y[Direction.Backward] || direction.y === -1,
//                     [Direction.Forward]:
//                         previousIntent.y[Direction.Forward] || direction.y === 1,
//                 },
//             };
//         },
//         [disabled, delta, previousDelta]
//     );
// }


// export interface ClientRect {
//     width: number;
//     height: number;
//     top: number;
//     left: number;
//     right: number;
//     bottom: number;
// }


// interface PositionalCoordinates
//     extends Pick<ClientRect, 'top' | 'left' | 'right' | 'bottom'> { }

// const defaultThreshold = {
//     x: 0.2,
//     y: 0.2,
// };

// export function getScrollDirectionAndSpeed(
//     scrollContainer: Element,
//     scrollContainerRect: ClientRect,
//     { top, left, right, bottom }: PositionalCoordinates,
//     acceleration = 10,
//     thresholdPercentage = defaultThreshold
// ) {
//     const { isTop, isBottom, isLeft, isRight } = getScrollPosition(scrollContainer);

//     const direction = {
//         x: 0,
//         y: 0,
//     };
//     const speed = {
//         x: 0,
//         y: 0,
//     };
//     const threshold = {
//         height: scrollContainerRect.height * thresholdPercentage.y,
//         width: scrollContainerRect.width * thresholdPercentage.x,
//     };

//     if (!isTop && top <= scrollContainerRect.top + threshold.height) {
//         // Scroll Up
//         direction.y = Direction.Backward;
//         speed.y =
//             acceleration *
//             Math.abs(
//                 (scrollContainerRect.top + threshold.height - top) / threshold.height
//             );
//     } else if (
//         !isBottom &&
//         bottom >= scrollContainerRect.bottom - threshold.height
//     ) {
//         // Scroll Down
//         direction.y = Direction.Forward;
//         speed.y =
//             acceleration *
//             Math.abs(
//                 (scrollContainerRect.bottom - threshold.height - bottom) /
//                 threshold.height
//             );
//     }

//     if (!isRight && right >= scrollContainerRect.right - threshold.width) {
//         // Scroll Right
//         direction.x = Direction.Forward;
//         speed.x =
//             acceleration *
//             Math.abs(
//                 (scrollContainerRect.right - threshold.width - right) / threshold.width
//             );
//     } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
//         // Scroll Left
//         direction.x = Direction.Backward;
//         speed.x =
//             acceleration *
//             Math.abs(
//                 (scrollContainerRect.left + threshold.width - left) / threshold.width
//             );
//     }

//     return {
//         direction,
//         speed,
//     };
// }



// export function getScrollPosition(scrollingContainer: Element) {
//     const minScroll = {
//         x: 0,
//         y: 0,
//     };
//     const dimensions = isDocumentScrollingElement(scrollingContainer)
//         ? {
//             height: window.innerHeight,
//             width: window.innerWidth,
//         }
//         : {
//             height: scrollingContainer.clientHeight,
//             width: scrollingContainer.clientWidth,
//         };
//     const maxScroll = {
//         x: scrollingContainer.scrollWidth - dimensions.width,
//         y: scrollingContainer.scrollHeight - dimensions.height,
//     };

//     const isTop = scrollingContainer.scrollTop <= minScroll.y;
//     const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
//     const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
//     const isRight = scrollingContainer.scrollLeft >= maxScroll.x;

//     return {
//         isTop,
//         isLeft,
//         isBottom,
//         isRight,
//         maxScroll,
//         minScroll,
//     };
// }


// import { canUseDOM } from '@dnd-kit/utilities';

// export function isDocumentScrollingElement(element: Element | null) {
//     if (!canUseDOM || !element) {
//         return false;
//     }

//     return element === document.scrollingElement;
// }
