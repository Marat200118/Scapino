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

let emptyReaders = []; // global variable to check empty readers
let isHighlightActive = false; // global variable to check if highlight is active

const init = async () => {
  displaySupportedState();
  updateSectionDisplay("start");
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

  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {
    // List cameras and microphones.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
        });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }

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

  // console.log("Ports");
  ports.forEach((port) => {
    const info = port.getInfo();
    console.log(info);
  });
  // console.log("Connected Arduino ports");
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




          if (json.reader === "Reader 2") {
            if (json.UID !== "No card present") {
              console.log("Received:", json.UID);
              updateHighlight(json.UID);
              isHighlightActive = true;
              emptyReaders = [];
            } else {
              // updateSectionDisplay("start");
              isHighlightActive = false;
            }
          } else if (!isHighlightActive) {

            // checking readers that are not highlight (Reader 2)

            const currentReader = readers.find(
              (reader) => reader.name === json.reader
            );


            if (json.UID !== "No card present") {
              currentReader.lastUIDPresent = json.UID;
              //if its inside the array, remove it
              if (emptyReaders.includes(currentReader)) {
                emptyReaders = emptyReaders.filter(
                  (reader) => reader !== currentReader
                );
              }

              if (emptyReaders.length == 0) {
                updateSectionDisplay("start");
                emptyReaders = [];
              }
            } else {

              // checking if empty readers are already in the array

              if (!emptyReaders.includes(currentReader)) {
                emptyReaders.push(currentReader);
                console.log(currentReader);
              }
            }
            if (emptyReaders.length === 0) {
              updateSectionDisplay("start");
              emptyReaders = [];
            } else if (emptyReaders.length === 1) {
              let currentItem = items.find((item) => item.UIDtag === emptyReaders[0].lastUIDPresent);

              if (!currentItem) {
                currentItem = items.find((item) => item.UID === emptyReaders[0].lastUIDPresent);
              }

              updateSectionDisplay(`in-between-${currentItem.section}`);
            } else if (emptyReaders.length > 1) {
              // console.log(emptyReaders.length);
              updateSectionDisplay("in-between-universal");
            }
          }

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



// const timeThreshold = 1550;




//store all the readers:
const readers = [
  {
    name: "Reader 1",
    lastUIDPresentTag: " 04 78 f1 91 78 00 00",
    lastUIDPresent: " 23 bd 8a 18",
  },
  {
    name: "Reader 2",
    lastUIDPresentTag: null,
    lastUIDPresent: null,
  },
  {
    name: "Reader 3",
    lastUIDPresentTag: " 04 60 f1 91 78 00 00",
    lastUIDPresent: " f3 c4 64 ee",
  },
  {
    name: "Reader 4",
    lastUIDPresentTag: " 04 60 f1 91 78 00 00",
    lastUIDPresent: " 83 22 d9 12",
  },
  {
    name: "Reader 5",
    lastUIDPresentTag: " 04 40 f1 91 78 00 00",
    lastUIDPresent: " 53 e1 71 ee",
  },
];

//Hardcoding every item UID card and sticker:
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
  } else {
    $notConnected.style.display = "block";
    $connected.style.display = "none";
  }
};

init();
