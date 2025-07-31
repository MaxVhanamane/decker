import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef } from "react";

const useCustomSensors = () => {
    const sensors = useRef([
        useSensor(MouseSensor, { activationConstraint: { distance: 0 } }),
        useSensor(TouchSensor, { activationConstraint: { distance: 0 } }),
        // useSensor(PointerSensor, { activationConstraint: { distance: 0 } }),
        useSensor(KeyboardSensor),
    ]).current;

    // Return the sensors using useSensors hook
    return useSensors(...sensors);
};

export { useCustomSensors };
