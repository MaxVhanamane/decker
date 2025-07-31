import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef } from "react";

const useCustomSensors = () => {
    const sensors = useRef([
        useSensor(MouseSensor, { activationConstraint: { distance: 3, delay: 100, } }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,   // wait 250ms before drag
                distance: 3 // small movement allowed while holding
            }
        }),
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};

export { useCustomSensors };
