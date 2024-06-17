import { gsap } from "gsap";

let object;

const inBetween = (string) => {
  document.querySelector(".in-between").style.display = "block";

  switch (string) {
    case "camera":
      object = camera;
      break;
    case "comb":
      object = comb;
      break;
    case "plaster-cast":
      object = plasterCast;
      break;
    case "test":
      object = test;
      break;
    default:
      object = camera;
      break;
  }

  const backgroundImage = document.querySelector(
    ".background-image-inbetween img"
  );

  const pickedObject = document.querySelector(".picked-object");
  const betweenTitle = document.querySelector(".between__title");
  const staticBackground = document.querySelector(
    ".background-image-inbetween-static img"
  );

  const staticBackgroundContainer = document.querySelector(
    ".background-image-inbetween-static"
  );

  backgroundImage.src = object.backgroundImage;
  staticBackground.src = object.staticBackground;
  pickedObject.textContent = object.pickedObject;
  betweenTitle.textContent = object.betweenTitle;

  staticBackgroundContainer.innerHTML = "";

  object.staticBackgrounds.forEach((bg, index) => {
    const staticBgImg = document.createElement("img");
    staticBgImg.src = bg.src;
    staticBgImg.style.top = `${bg.top}rem`;
    staticBgImg.style.transform = `rotate(${bg.rotate}deg) scale(${bg.scale})`;
    staticBackgroundContainer.appendChild(staticBgImg);
  });

  // const backgroundRotations = [
  //   { rotate: 0, scale: 1 },
  //   { rotate: 0, scale: 1 },
  //   { rotate: 0, scale: 1 },
  //   { rotate: 0, scale: 1.5 },
  // ];

  // backgroundRotations.forEach((rotation, index) => {
  //   staticBackground.style.transform = `rotate(${rotation.rotate}deg) scale(${rotation.scale})`;
  // });

  animateBackgroundImages(object.backgroundImage);
};

const camera = {
  backgroundImage: "./src/assets/scans/camera.png",
  staticBackground: "./src/assets/scans/camera-dark.png",
  staticBackgrounds: [
    { src: "./src/assets/scans/camera-dark.png", rotate: 0, scale: 1 },
  ],
  pickedObject: "Surveillance camera",
  betweenTitle: "Societal norms",
};

const comb = {
  backgroundImage: "./src/assets/scans/comb.png",
  staticBackground: "./src/assets/scans/comb-dark.png",
  staticBackgrounds: [
    { src: "./src/assets/scans/comb-dark.png", rotate: 0, scale: 1.5 },
  ],
  pickedObject: "Barbie comb",
  betweenTitle: "Misogyny",
};

const plasterCast = {
  backgroundImage: "./src/assets/scans/head.png",
  backgroundImage2: "./src/assets/scans/head-side.png",
  staticBackground: "./src/assets/scans/head-dark.png",
  staticBackgrounds: [
    { src: "./src/assets/scans/head-dark.png", rotate: 0, scale: 1.1, top: -4 },
  ],
  pickedObject: "Plaster cast",
  betweenTitle: "Meaning of life",
};

const test = {
  backgroundImage: "./src/assets/scans/test.png",
  staticBackground: "./src/assets/scans/preg-dark.png",
  staticBackgrounds: [
    { src: "./src/assets/scans/preg-dark.png", rotate: 0, scale: 1.1 },
  ],
  pickedObject: "Pregnancy test",
  betweenTitle: "Reproductive rights",
};

const positions = [
  { x: 0.07, y: 0.1, rotate: 180, zIndex: 0, scale: 0.5, opacity: 0.6 },
  { x: 0.4, y: 0.95, rotate: 180, zIndex: 0, scale: 0.5, opacity: 0.5 },
  { x: 0.9, y: 0.3, rotate: -40, zIndex: 0, scale: 0.4, opacity: 0.3 },
  { x: 0.07, y: 0.9, rotate: -230, zIndex: 0, scale: 0.6, opacity: 0.8 },
  { x: 0.65, y: 0.8, rotate: 160, zIndex: 0, scale: 0.35, opacity: 0.5 },
  { x: 0.95, y: 0.85, rotate: 210, zIndex: 0, scale: 0.5, opacity: 0.7 },
];

const animateBackgroundImages = (src) => {
  const container = document.querySelector(".background-image-inbetween");

  container.innerHTML = "";

  positions.forEach((pos, index) => {
    const img = document.createElement("img");
    img.classList.add("floating-image");
    img.style.opacity = pos.opacity;
    img.style.top = `${pos.y * 100}%`;
    img.style.left = `${pos.x * 100}%`;
    img.style.transform = `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`;

    if (src === plasterCast.backgroundImage) {
      img.src = index === 0 || index === 2 || index === 5
        ? plasterCast.backgroundImage2
        : src;
        if (index === 2) {
          img.style.transform = `translate(-50%, -50%) rotate(10deg) scale(${pos.scale})`;
        } else if (index === 0) {
          img.style.transform = `rotate(-30deg) scale(${pos.scale})`;
          img.style.top = `${pos.y - 20}%`;
          img.style.left = `${pos.x - 5}%`;
        } else if (index === 5) {
          img.style.transform = `translate(-50%, -50%) rotate(30deg) scale(${
            pos.scale + 0.5
          })`;
        }
    } else {
      img.src = src;
    }


    container.appendChild(img);

    gsap.to(img, {
      y: "+=20",
      rotate: "+=15",
      transformOrigin: "50% 50%",
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: "power1.inOut",
      delay: index * 0.6,
    });
  });
};

export { inBetween };
