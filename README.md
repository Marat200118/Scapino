# Scapino
The integration 4 project in collaboration with Rotterdam University of Applied Sciences and dance studio Scapino.

## Check out our WIKI page!
Everything about this project you can find in this repository **Wiki** page: https://github.com/Marat200118/Scapino/wiki
 
## Table of contents
- [Getting started](#getting-started)
- [Links to other repositories](#links-to-other-repositories)
- [Code Readme](#code-readme)

## Links to other repositories
Figma project link: https://www.figma.com/team_invite/redeem/nGwHYTaNVkRE9XJfl6RH5w

GitHub scrum project link: https://github.com/users/Marat200118/projects/5/views/1

Case study presentation: https://www.figma.com/proto/wvZXxtBsV2u6mOf5LUKcqq/Research?page-id=338%3A333&node-id=338-343&viewport=376%2C168%2C0.05&t=cuDZiuLPlT5yDSYE-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=338%3A343

## Getting started

### The brief
At the start of the Integration project we were introduced to the client and their needs. We work with Scapino - modern ballet studio, based in Rotterdam. The main problem, that we are going to solve for them is that Scapino wants to attract younger target audience to their shows and community.

### "How might we?" question
How might we **inform** art students from **18 to 25 years old** who are **already interested in visual arts**, but feel a **lack of connection** to modern ballet so that they **recognise the modern ballet as a compelling form of art?**


## Code Readme

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

```
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



### Video-experiment folder + p5js files


### Website folder
