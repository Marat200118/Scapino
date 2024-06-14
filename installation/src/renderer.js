import "./index.css";
import { updateSectionDisplay } from "./update-sections";

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

const init = async () => {
  displaySupportedState();
  updateSectionDisplay(currentState.section, items);
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
          // setTimeout(updateCircle(json), 1000);
          if (json.reader === "Reader 2") {
            if (json.UID !== "No card present") {
              console.log("Received:", json.UID);
              updateHighlight(json.UID);
            } else {
              // console.log("No card present");
              updateSectionDisplay("start");
            }
          }
          // if (json.reader === "Reader 1") {
          //   if ((json.UID !== "No card present") && (json.UID !== "Card previously present")) {
          //     readers[2].lastUIDPresent = json.UID;
          //     console.log(json.UID);
          //   }
          // else if (json.UID === "Card previously present") {
          //   console.log(`You just picked up ${readers[2].lastUIDPresent}`);
          //   updateSectionDisplay("in-between");
          // }
          //}
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



const timeThreshold = 1550;




//store all the readers:
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

// let highlightIsActive = false;

//start with the first state:
let currentState = states[0];
const checkOnce = () => {
  //check if it's 1-4 readers:
  if (json.reader !== "Reader 5") {
    if (json.UID !== "No card present") {
      // json.UID
    }
  }
};

const updateHighlight = (uid) => {
  let currentItem = items.find((item) => item.UIDtag === uid);
  if (!currentItem) {
    currentItem = items.find((item) => item.UID === uid);
  }
  updateSectionDisplay(currentItem.section);
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
