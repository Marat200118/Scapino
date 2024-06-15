import "./index.css";

import { gsap } from "gsap";

const initReproductiveRightsAnimation = () => {
  reproductiveRights();
};

const reproductiveRights = () => {
  const images = document.querySelectorAll(".images img");
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const positions = [
    {
      x: -windowWidth * 0.45,
      y: -windowHeight * 0.4,
      rotate: -40,
      zIndex: 0,
    },
    {
      x: -windowWidth * 0.43,
      y: -windowHeight * 0.01,
      rotate: -55,
      zIndex: 0,
    },
    { x: -windowWidth * 0.3, y: -windowHeight * 0.05, rotate: 30, zIndex: 0 },
    { x: -windowWidth * 0.15, y: windowHeight * 0, rotate: -30, zIndex: 0 },
    { x: -windowWidth * 0, y: windowHeight * 0, rotate: 0, zIndex: 0 },
    { x: windowWidth * 0.15, y: windowHeight * 0, rotate: -15, zIndex: 0 },
    { x: windowWidth * 0.4, y: -windowHeight * 0.2, rotate: 25, zIndex: 0 },
    { x: windowWidth * 0.4, y: -windowHeight * 0.35, rotate: -15, zIndex: 0 },
    { x: windowWidth * 0.3, y: windowHeight * 0, rotate: -25, zIndex: 0 },
    { x: windowWidth * 0.45, y: -windowHeight * 0.65, rotate: 5, zIndex: 0 },
  ];

  images.forEach((img, index) => {
    const position = positions[index];
    gsap.to(img, {
      duration: 2,
      x: position.x,
      y: position.y,
      rotation: position.rotate,
      zIndex: position.zIndex,
      ease: "power2.inOut",
      delay: index * 0.2,
    });
  });

  gsap.to(".description", {
    opacity: 1,
    duration: 2,
    delay: images.length * 0.2,
  });
};

initReproductiveRightsAnimation();

export { initReproductiveRightsAnimation };
