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
                delay: 500,
                tolerance: { x: 3, y: 3 }
            }
        })
        ,
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};
export { useCustomSensors };
