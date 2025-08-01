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
                delay: 300,   // enough to distinguish tap vs drag
                distance: 8   // user must move ~8px to trigger drag
            }
        })
        ,
        useSensor(KeyboardSensor),
    ]).current;

    return useSensors(...sensors);
};
export { useCustomSensors };
