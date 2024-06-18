import { sketch } from "./sketch";

export const setupCanvas = () => {
    if (window.currentP5Instance) {
        window.currentP5Instance.remove(); // Remove existing p5 instance
    }
    window.currentP5Instance = new p5(sketch); // Create a new p5 instance
};
