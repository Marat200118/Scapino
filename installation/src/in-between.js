import { gsap } from "gsap";

const switchSections = (object) => {
  const backgroundImage = document.querySelector(
    ".background-image-inbetween img"
  );
  const pickedObject = document.querySelector(".picked-object");
  const betweenTitle = document.querySelector(".between__title");
  const staticBackground = document.querySelector(
    ".background-image-inbetween-static img"
  );

  backgroundImage.src = object.backgroundImage;
  staticBackground.src = object.staticBackground;
  pickedObject.textContent = object.pickedObject;
  betweenTitle.textContent = object.betweenTitle;


  animateBackgroundImages(object.backgroundImage);

};

const camera = {
  backgroundImage: "./src/assets/scans/camera.png",
  staticBackground: "./src/assets/scans/camera.png",
  pickedObject: "Surveillance camera",
  betweenTitle: "Societal norms",
};

const comb = {
  backgroundImage: "./src/assets/scans/comb.png",
  staticBackground: "./src/assets/scans/comb.png",
  pickedObject: "Barbie comb",
  betweenTitle: "Misogyny",
};

const plasterCast = {
  backgroundImage: "./src/assets/scans/head.png",
  staticBackground: "./src/assets/scans/head.png",
  pickedObject: "Plaster cast",
  betweenTitle: "Meaning of life",
};

const test = {
  backgroundImage: "./src/assets/scans/test.png",
  staticBackground: "./src/assets/scans/test.png",
  pickedObject: "Pregnancy test",
  betweenTitle: "Reproductive rights",
};

const positions = [
  { x: 0.2, y: 0.2, rotate: -17, zIndex: 0, scale: 0.6 },
  { x: 0.9, y: 0.4, rotate: 25, zIndex: 0, scale: 0.5 },
  { x: 0.1, y: 0.8, rotate: -25, zIndex: 0, scale: 0.4 },
];

const animateBackgroundImages = (src) => {
  const container = document.querySelector(".background-image-inbetween");

  container.innerHTML = "";

  positions.forEach((pos, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("floating-image");
    img.style.top = `${pos.y * 100}%`;
    img.style.left = `${pos.x * 100}%`;
    img.style.transform = `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`;
    container.appendChild(img);

    gsap.to(img, {
      y: "+=20",
      rotate: pos.rotate + 15,
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: "power1.inOut",
      delay: index * 0.6,
    });
  });
};

const init = () => {
  switchSections(camera);
};



init();