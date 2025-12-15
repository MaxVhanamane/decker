import { KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef } from "react";

const useCustomSensors = () => {
    const sensors = useRef([
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 0,
                tolerance: { x: 4, y: 4 }
            }
        })
        ,
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};
export { useCustomSensors };
