import { KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef } from "react";

const useCustomSensors = () => {
    const sensors = useRef([
        useSensor(PointerSensor, {
            activationConstraint: {
                // Increase from 4 to 10. This gives your finger enough 
                // "wiggle room" to swipe down vertically without accidentally 
                // triggering a drag from horizontal movement.
                distance: 10
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                // Require pressing and holding for 250ms to activate a drag on mobile
                delay: 250,
                // Allow 5px of movement during that 250ms delay so it doesn't 
                // cancel the drag if the user's finger twitches slightly
                tolerance: 5
            }
        }),
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};

export { useCustomSensors };
