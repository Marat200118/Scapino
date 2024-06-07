import "./index.css";

// app state
const hasWebSerial = "serial" in navigator;
let isConnected = false;

const $notSupported = document.getElementById("not-supported");
const $supported = document.getElementById("supported");
const $notConnected = document.getElementById("not-connected");
const $connected = document.getElementById("connected");

const $connectButton = document.getElementById("connectButton");

const arduinoInfo = {
  usbProductId: 32823,
  usbVendorId: 9025,
};
let connectedArduinoPorts = [];

let writer;
const $circle1 = document.getElementById("circle1");
const $circle2 = document.getElementById("circle2");
const $circle3 = document.getElementById("circle3");
const $circle4 = document.getElementById("circle4");
const $circle5 = document.getElementById("circle5");

const init = async () => {
  displaySupportedState();
  if (!hasWebSerial) return;
  displayConnectionState();

  navigator.serial.addEventListener("connect", (e) => {
    const port = e.target;
    const info = port.getInfo();
    console.log("connect", port, info);
    if (isArduinoPort(port)) {
      connectedArduinoPorts.push(port);
      if (!isConnected) {
        connect(port);
      }
    }
  });

  navigator.serial.addEventListener("disconnect", (e) => {
    const port = e.target;
    const info = port.getInfo();
    console.log("disconnect", port, info);
    connectedArduinoPorts = connectedArduinoPorts.filter((p) => p !== port);
    if (connectedArduinoPorts.length === 0) {
      isConnected = false;
      displayConnectionState();
    }
  });

  const ports = await navigator.serial.getPorts();
  connectedArduinoPorts = ports.filter(isArduinoPort);

  console.log("Ports");
  ports.forEach((port) => {
    const info = port.getInfo();
    console.log(info);
  });
  console.log("Connected Arduino ports");
  connectedArduinoPorts.forEach((port) => {
    const info = port.getInfo();
    console.log(info);
  });

  if (connectedArduinoPorts.length > 0) {
    connect(connectedArduinoPorts[0]);
  }

  $connectButton.addEventListener("click", handleClickConnect);
};

const isArduinoPort = (port) => {
  const info = port.getInfo();
  return (
    info.usbProductId === arduinoInfo.usbProductId &&
    info.usbVendorId === arduinoInfo.usbVendorId
  );
};

const handleClickConnect = async () => {
  const port = await navigator.serial.requestPort();
  console.log(port);
  const info = port.getInfo();
  console.log(info);
  await connect(port);
};

const connect = async (port) => {
  try {
    await port.open({ baudRate: 9600 });
    isConnected = true;
    displayConnectionState();
    console.log("Port opened");

    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);

    const inputStream = textDecoder.readable.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          const text = chunk;
          const lines = text.split("\n");
          lines[0] = (this.remainder || "") + lines[0];
          this.remainder = lines.pop();
          lines.forEach((line) => controller.enqueue(line));
        },
        flush(controller) {
          if (this.remainder) {
            controller.enqueue(this.remainder);
          }
        },
      })
    );
    const reader = inputStream.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        // console.log("Received:", value);
        try {
          const json = JSON.parse(value);
          // console.log(json);
          updateCircle(json);
          updateSectionDisplay();
        } catch (error) {
          // console.log("Received non-JSON message:", value);
        }
      }
    }
  } catch (error) {
    if (error.message.includes("Failed to open serial port")) {
      console.error("Failed to open port:", error);
      alert(
        "Failed to open serial port. Make sure no other applications are using the port."
      );
    } else {
      console.error("Error connecting to port:", error);
    }
  }
};


let cardPresentCount1 = 0;
let cardPresentCount2 = 0;
let cardPresentCount3 = 0;
let cardPresentCount4 = 0;
let cardPresentCount5 = 0;
let lastUpdatedTime1 = 0;
let lastUpdatedTime2 = 0;
let lastUpdatedTime3 = 0;
let lastUpdatedTime4 = 0;
let lastUpdatedTime5 = 0;
const timeThreshold = 1000;


//store all the readers:
const readersNames = ["Reader 1", "Reader 2", "Reader 3", "Reader 4", "Reader 5"];
//store the count of card present for each reader:
// const cardPresentCounts = [0, 0, 0, 0, 0];

const readers = [
  {
    name: "Reader 1",
    lastUIDPresent: " 04 78 f1 91 78 00 00",
  },
  {
    name: "Reader 2",
    lastUIDPresent: " 04 40 f1 91 78 00 00",
  },
  {
    name: "Reader 3",
    lastUIDPresent: " 04 60 f1 91 78 00 00",
  },
  {
    name: "Reader 4",
    lastUIDPresent: " 04 60 f1 91 78 00 00",
  },
  {
    name: "Reader 5",
    lastUIDPresent: null,
  },
];

const items = [
  {
    UID: " 04 78 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
  },
  {
    UID: " 04 40 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,

  },
  {
    //RANDOM
    UID: " 04 60 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
  },
  {
    //RANDOM
    UID: " 04 77 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
  },
]

//store all possible states:
const states = [
  {
    section: "start",
  },
  {
    section: "in-between",
  },
  {
    section: "content",
  },
];

let highlightIsActive = false;

//start with the first state:
let currentState = states[0];

const updateCircle = (json) => {
  const now = Date.now();

  // if (json.UID !== "No card present") {
  console.log(json.UID);
  items.forEach((item) => {
    if (item.UID === json.UID) {
      if (item.presentCounts === 0) {
        item.lastUpdatedTime = now;
        item.presentCounts++;
      } else if (now - item.lastUpdatedTime < timeThreshold) {
        item.presentCounts++;
        item.lastUpdatedTime = now;

      }
    } else if (json.UID === "No card present") {
      const reader = readers.find((r) => r.name === json.reader);
      const lastPresentCard = items.find((i) => i.UID === reader.lastUIDPresent);
      console.log(lastPresentCard);
      if (lastPresentCard && (now - lastPresentCard.lastUpdatedTime > timeThreshold)) {
        lastPresentCard.presentCounts = 0;

      }
    }
    item.isHighlighted = json.reader === "Reader 5" ? item.presentCounts > 3 : false;
    item.isPresent = item.presentCounts > 3;

    if (item.isPresent) {
      const reader = readers.find((r) => r.name === json.reader);
      if (reader) {
        reader.lastUIDPresent = item.UID;
      }
    }
    // console.log(item);
  });

  // console.log(items[0]);

  $circle1.style.backgroundColor = items[0].isPresent ? "green" : "red";
  $circle2.style.backgroundColor = items[1].isPresent ? "green" : "red";
  $circle3.style.backgroundColor = items[2].isPresent ? "green" : "red";
  $circle4.style.backgroundColor = items[3].isPresent ? "green" : "red";
  $circle5.style.backgroundColor = items[0].isHighlighted ? "green" : "red";
  // } else {
  //   const reader = readers.find((r) => r.name === json.reader);
  //   if (reader) {
  //     const lastPresentCard = items.find((item) => item.UID === reader.lastUIDPresent);
  //     if (now - lastPresentCard.lastUpdatedTime > timeThreshold) {
  //       lastPresentCard.presentCounts = 0;
  //     }
  //   }
  // }









  //check if the card is present:
  // if (json.UID !== "No card present") {
  //   //loop over all the readers:
  //   for (let i = 0; i < readersNames.length; i++) {
  //     if (json.reader === readersNames[i]) {
  //       //which item is present?
  //       // loop over all the items:
  //       for (let j = 0; j < items.length; j++) {
  //         //check if the item is the same as the one in the json:
  //         if (json.UID === items[j].UID) {
  //           //check if the card is present for the first time:
  //           if (items[j].presentCounts === 0) {
  //             items[j].lastUpdatedTime = now;
  //             items[j].presentCounts++;
  //           }
  //           //if it's not first time, we check time threshold:
  //           else if (now - items[j].lastUpdatedTime < timeThreshold) {
  //             items[j].presentCounts++;
  //             items[j].lastUpdatedTime = now;
  //           }
  //         }
  //         //are we in highlight?
  //         if (i = 4) {
  //           items[j].isHighlightedighlighted = (items[j].presentCounts > 3);
  //         } else {
  //           items[j].isPresent = (items[j].presentCounts > 3);
  //         }
  //       }
  //     }
  //   }

  // } else {
  //loopover all the 
  //}

  // if (json.UID !== "No card present") {
  //   if (json.reader === "Reader 1") {
  //     if (cardPresentCount1 === 0) {
  //       lastUpdatedTime1 = now;
  //       cardPresentCount1++;
  //     } else if (now - lastUpdatedTime1 < timeThreshold) {
  //       cardPresentCount1++;
  //       lastUpdatedTime1 = now;
  //     }
  //   } else if (json.reader === "Reader 2") {
  //     if (cardPresentCount2 === 0) {
  //       lastUpdatedTime2 = now;
  //       cardPresentCount2++;
  //     } else if (now - lastUpdatedTime2 < timeThreshold) {
  //       cardPresentCount2++;
  //       lastUpdatedTime2 = now;
  //     }
  //   } else if (json.reader === "Reader 3") {
  //     if (cardPresentCount3 === 0) {
  //       lastUpdatedTime3 = now;
  //       cardPresentCount3++;
  //     } else if (now - lastUpdatedTime3 < timeThreshold) {
  //       cardPresentCount3++;
  //       lastUpdatedTime3 = now;
  //     }
  //   } else if (json.reader === "Reader 4") {
  //     if (cardPresentCount4 === 0) {
  //       lastUpdatedTime4 = now;
  //       cardPresentCount4++;
  //     } else if (now - lastUpdatedTime4 < timeThreshold) {
  //       cardPresentCount4++;
  //       lastUpdatedTime4 = now;
  //     }
  //   } else if (json.reader === "Reader 5") {
  //     if (cardPresentCount5 === 0) {
  //       lastUpdatedTime5 = now;
  //       cardPresentCount5++;
  //     } else if (now - lastUpdatedTime5 < timeThreshold) {
  //       cardPresentCount5++;
  //       lastUpdatedTime5 = now;
  //     }
  //   }
  // } else {
  // if (now - lastUpdatedTime1 > timeThreshold) {
  //   cardPresentCount1 = 0;
  // }
  // if (now - lastUpdatedTime2 > timeThreshold) {
  //   cardPresentCount2 = 0;
  // }
  // if (now - lastUpdatedTime3 > timeThreshold) {
  //   cardPresentCount3 = 0;
  // }
  // if (now - lastUpdatedTime4 > timeThreshold) {
  //   cardPresentCount4 = 0;
  // }
  // if (now - lastUpdatedTime5 > timeThreshold) {
  //   cardPresentCount5 = 0;
  // }

  //}
};

const updateSectionDisplay = () => {
  const circle1Green = $circle1.style.backgroundColor === "green";
  const circle2Green = $circle2.style.backgroundColor === "green";
  const circle3Green = $circle3.style.backgroundColor === "green";

  document.querySelector(".introduction").style.display = "none";
  document.querySelector(".between-section").style.display = "none";
  document.querySelector(".interview").style.display = "none";
  document.querySelector(".dance").style.display = "none";

  document.querySelectorAll("video").forEach((video) => {
    video.pause();
  });

  if (circle1Green && circle2Green) {
    document.querySelector(".introduction").style.display = "block";
  } else if (circle1Green && !circle2Green && !circle3Green) {
    document.querySelector(".between-section").style.display = "block";
  } else if (!circle1Green && circle2Green && !circle3Green) {
    document.querySelector(".between-section").style.display = "block";
  } else if (circle1Green && circle3Green) {
    document.querySelector(".dance").style.display = "block";
    const danceVideo = document.querySelector(".dance video");
    danceVideo.play();
  } else if (circle2Green && circle3Green) {
    document.querySelector(".interview").style.display = "block";
    const interviewVideo = document.querySelector(".interview video");
    interviewVideo.play();
  } else {
    document.querySelector(".introduction").style.display = "block";
  }
};


const displaySupportedState = () => {
  if (hasWebSerial) {
    $notSupported.style.display = "none";
    $supported.style.display = "block";
  } else {
    $notSupported.style.display = "block";
    $supported.style.display = "none";
  }
};

const displayConnectionState = () => {
  if (isConnected) {
    $notConnected.style.display = "none";
    $connected.style.display = "block";
  } else {
    $notConnected.style.display = "block";
    $connected.style.display = "none";
  }
};

init();
