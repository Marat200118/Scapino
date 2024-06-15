# Scapino - Pandora's Boxes of Origin
The integration 4 project in collaboration with Rotterdam University of Applied Sciences and dance studio Scapino.

![Begin screen](https://github.com/Marat200118/Scapino/assets/37581663/cfc9077b-59cc-4463-bb54-b067d7e76cba)

## Check out our WIKI page!
Everything about this project you can find in this repository **Wiki** page: https://github.com/Marat200118/Scapino/wiki
 
## Table of contents
- [Getting started](#getting-started)
- [Links to other repositories](#links-to-other-repositories)
- [Code Documentation](#code-documentation)

## Links to other repositories
Figma project link: https://www.figma.com/team_invite/redeem/nGwHYTaNVkRE9XJfl6RH5w

GitHub scrum project link: https://github.com/users/Marat200118/projects/5/views/1

Case study presentation: https://www.figma.com/proto/wvZXxtBsV2u6mOf5LUKcqq/Research?page-id=338%3A333&node-id=338-343&viewport=376%2C168%2C0.05&t=cuDZiuLPlT5yDSYE-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=338%3A343

## Getting started

### The brief
At the start of the Integration project we were introduced to the client and their needs. We work with Scapino - modern ballet studio, based in Rotterdam. The main problem, that we are going to solve for them is that Scapino wants to attract younger target audience to their shows and community.

### "How might we?" question
How might we **inform** art students from **18 to 25 years old** who are **already interested in visual arts**, but feel a **lack of connection** to modern ballet so that they **recognise the modern ballet as a compelling form of art?**


## Code Documentation

### Arduino folder

In this folder you are able to see different iterations of our arduino code, as well as final sketch (**final-sketch-working-final**) that sends the data to our installation electron project. Due to the nfc special working approach we managed to make the reading stable with switching NFC reader off and switching it on after each time the reader receives the data about tag or card.

Due to our concept, we use the NFC readers to detect the presence of the object (with nfc tag on it) and then based on this data we manipulate our content in Electron app. We send the data from Arduino to Electron using the ArduinoJSON library. Due to a looot of problems during our experiments with nfc readers, our teachers suggested to experiment with individual setup Arduino - RFID reader, and then connect them using the Master and Slave built in connection. This approach worked well, but still scaners were not precise.

We founded a solution in switching them off and on, after each time they detect a tag:

```
reader.PICC_HaltA();
reader.PCD_StopCrypto1();
reader.PCD_Init();
```

Step by step code setup for multiple readers. Starting from **nfc-reader-setup-arduinoMicro** to **5nfc-readers-setup-arduinoMicro**, as well some iterations with Led, delay and different board (Arduino Uno)

### Installation folder

Our installation folder is where our code of Electron app is written. This is made for the physical installation, in tandem with arduino, this makes a personalised and unique experience for the users.

#### Gsap.js
Gsap.js file animates the reproductive right section using **GSAP**. For each image used in the section, we provide the final position, and then with **gsap.to** they are animated

```js
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
```

#### Dynamical section update

To dynamicaly update our sections we wrote the logic, which creates the following flow:

1. Based on Readers scaned Tag UID or Card UID we assign to them the section:

```js
const items = [
  {
    UID: " 23 bd 8a 18",
    UIDtag: " 04 e8 ea 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "societal-norms",
  },
  {
    UID: " 53 e1 71 ee",
    UIDtag: " 04 32 ef 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "misogyny",
  },
  {
    UID: " f3 c4 64 ee",
    UIDtag: " 04 50 ef 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "life",
  },
  {
    UID: " 83 22 d9 12",
    UIDtag: " 04 03 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "reproductive-rights",
  },
];
```

2. After this we pass the string containing the section naming to the **update-sections.js**, and then the function with switch displays or hides the sections:

```js
const updateSectionDisplay = (currentSection) => {
  if (currentSection === prevSection) {
    return;
  }
  prevSection = currentSection;
  console.log(`I'm here with ${currentSection}`);

  document.querySelector(".introduction").style.display = "none";
  document.querySelector(".in-between").style.display = "none";
  document.querySelector(".in-between-universal").style.display = "none";
  document.querySelector(".misogyny").style.display = "none";
  document.querySelector(".life").style.display = "none";
  document.querySelector(".norms").style.display = "none";
  document.querySelector(".reproductive-rights").style.display = "none";
  document.querySelectorAll("video").forEach((video) => {
    video.pause();
  });

  switch (currentSection) {
    case "start":
      document.querySelector(".introduction").style.display = "block";
      console.log("start");
      break;
    case "in-between-societal-norms":
      inBetween("camera");
      break;
    case "in-between-misogyny":
      console.log("in-between-misogyny");
      inBetween("comb");
      break;
    case "in-between-reproductive-rights":
      inBetween("test");
      break;
    case "in-between-life":
      inBetween("plaster-cast");
      break;
    case "in-between-universal":
      document.querySelector(".in-between-universal").style.display = "block";
      break;
    case "misogyny":
      document.querySelector(".misogyny").style.display = "block";
      document.querySelector(".misogyny video").play();
      break;
    case "life":
      document.querySelector(".life").style.display = "block";
      document.querySelector(".life video").play();
      break;
    case "societal-norms":
      document.querySelector(".norms").style.display = "block";
      break;
    case "reproductive-rights":
      document.querySelector(".reproductive-rights").style.display = "block";
      initReproductiveRightsAnimation(); //tryin to call the function here to reset the GSAP animation
      break;
    default:
      document.querySelector(".introduction").style.display = "block";
      break;
  }
};
```
#### In Between section logic

When the user picks up the object **(before placing it in highlight)** we show the in-between section. We have 4 objects, but to make code more optimised and sustainable we created the 1 section and based on the picked object we update the section with this object content accordingly, the function inBetween also receives a string and then with swich replaces the content:

```html
<section class="in-between">
      <div class="logo-right">
        <img src="./src/assets/scapino-logo.png" alt="Scapino logo" class="right-logo">
      </div>
      <div class="background-image-inbetween">
        <img src="" alt="Reproductive Rights" class="background-image">
      </div>
      <div class="background-image-inbetween-static">
        <img src="" alt="" class="background">
      </div>
      <p class="picked-object">Pregnancy test</p>
      <h2 class="between__title">Reproductive rights</h2>
      <div class="flex-container-inbetween">
        <p class="between-text-left">Hold it <span>against your phone</span> to explore the topic</p>
        <p class="or">OR</p>
        <p class="between-text-right">Put it into the <span>highlight</span></p>
      </div>
    </section>
```

```js
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
  { x: 0.4, y: 0.8, rotate: 10, zIndex: 0, scale: 0.6 },
  { x: 0.7, y: 0.8, rotate: 10, zIndex: 0, scale: 0.4 },
  { x: 0.1, y: 0.8, rotate: -25, zIndex: 0, scale: 0.4 },
  { x: 0.9, y: 0.8, rotate: 35, zIndex: 0, scale: 0.7 },
];
```

That's how we use this function in our renderer.js:

```js
if (emptyReaders.length === 0) {
              updateSectionDisplay("start");
              emptyReaders = [];
            } else if (emptyReaders.length === 1) {
              let currentItem = items.find((item)=> item.UIDtag === emptyReaders[0].lastUIDPresent);
            
              if (!currentItem) {
                currentItem = items.find((item)=> item.UID === emptyReaders[0].lastUIDPresent);
              }
              
              updateSectionDisplay(`in-between-${currentItem.section}`);
            } else if (emptyReaders.length > 1) {
              // console.log(emptyReaders.length);
              updateSectionDisplay("in-between-universal");
            }

```





### Video-experiment folder + p5js files

In one of our screens we have the video filter, which is made in p5js, if you want to explore the process of creating this filter you can visit following links:

#### First iteration of video filter

https://editor.p5js.org/EleonoraDrykina/sketches/koONRonbT

#### Second iteration based on design & concept progress

https://editor.p5js.org/EleonoraDrykina/sketches/qNOUJNjei

#### Final iteration with our design texture imitation:

https://editor.p5js.org/EleonoraDrykina/sketches/x2xX7Yuy2

After we created the video filter we implemented it in our installation, in on of the sections

```html
<section class="norms">
      <div class="logo-right">
        <img src="./src/assets/scapino-logo.png" alt="Scapino logo" class="right-logo">
      </div>
      <div class="flex-container">
        <div class="norms-text">
          <h2>Societal norms</h2>
          <p class="norms-text-paragraph">When creating a work in <span>China,</span> it is important to promote
            <span>positive energy.</span> The so-called “normal” <span>emotions</span> are
            <span>uppressed,</span> suffocating, distorted, or weird. Perhaps for <span>Western culture</span> it is
            important to explore human
            nature, to
            directly face things.
          </p>
        </div>
        <div class="video-filter"></div>
      </div>
    </section>
```

```js
let posteriseShader;
let video;

let font;

let poseNet;
let pose;

let frequency = 10.0; // You can adjust this value
//my favourite is 1-25
let amplitude = 0.1; // You can adjust this value

let aspectRatio;
// console.log("ml5 version:", ml5.version);

function preload() {
  // Load the shader to use as a filter
  posteriseShader = loadShader("/src/p5/filter.vert", "/src/p5/filter.frag");
}

function setup() {
  let canvas = createCanvas(800, 600, WEBGL);
  canvas.parent(document.querySelector(".video-filter"));

  // Capture the video
  video = createCapture(VIDEO);
  aspectRatio = video.width / video.height;
  video.size(video.width, video.height);
  video.hide(); // Hide the default video DOM element

  // Initialize PoseNet model and set the pose detection callback
  poseNet = ml5.poseNet(video, () => console.log("PoseNet model loaded"), true);
  poseNet.on("pose", (poses) => {
    if (poses.length > 0) {
      pose = poses[0].pose;
    }
  });
}

function draw() {
  let referencePoint;
  if (pose) {
    referencePoint = createVector(pose.nose.x, pose.nose.y);
  } else {
    referencePoint = createVector(width / 2, height / 2);
  }

  // Set the shader
  shader(posteriseShader);

  posteriseShader.setUniform("filter_background", video);
  posteriseShader.setUniform("filter_res", [video.width, video.height]);

  frequency = map(referencePoint.x, 0, width, 0, 25);
  frequency = constrain(frequency, 0, 25);
  posteriseShader.setUniform("frequency", frequency);

  amplitude = map(referencePoint.y, 0, height, 0.05, 0.2);
  amplitude = constrain(amplitude, 0.01, 0.1);
  posteriseShader.setUniform("amplitude", amplitude);

  posteriseShader.setUniform("time", millis() / 1000.0);

  // Draw a rectangle with the video texture and shader applied
  rect(0, 0, height * aspectRatio, height);
}
```


### Website folder
