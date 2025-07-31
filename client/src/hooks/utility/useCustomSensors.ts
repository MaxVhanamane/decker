import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef } from "react";

const useCustomSensors = () => {
    const sensors = useRef([
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 3
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 500,     // Longer delay for mobile - gives time to start scroll
                distance: 10,   // More distance tolerance
                tolerance: {
                    x: 5,       // Allow 5px horizontal movement
                    y: 5        // Allow 5px vertical movement
                }
            }
        }),
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};
export { useCustomSensors };
