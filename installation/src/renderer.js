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
          setTimeout(updateCircle(json), 1000);
          if (json.reader === "Reader 5") {
            console.log("Received:", json.UID);

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
    UID: " 04 78 f1 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "societal-norms",
  },
  {
    UID: " 04 32 ef 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "misogyny",

  },
  {
    UID: " 04 50 ef 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "life",
  },
  {
    UID: " 04 e8 ea 91 78 00 00",
    presentCounts: 0,
    lastUpdatedTime: 0,
    isHighlighted: false,
    isPresent: true,
    section: "societal-norms",
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

// let highlightIsActive = false;

//start with the first state:
let currentState = states[0];

const updateCircle = (json) => {
  const now = Date.now();
  if (json.UID !== "No card present") {
    // console.log(json.UID);
  }
  items.forEach((item) => {
    if (item.UID === json.UID) {
      // if (item.presentCounts === 0) {
      //   console.log(item.UID)
      //   item.lastUpdatedTime = now;
      //   item.presentCounts++;
      // } else if (now - item.lastUpdatedTime < timeThreshold) {
      //   item.presentCounts++;
      //   item.lastUpdatedTime = now;
      // }
      item.isPresent = true;
      item.presentCounts = 0;
      item.isHighlighted = (json.reader === "Reader 5") ? true : false;
    } else if (json.UID === "No card present") {
      const reader = readers.find((r) => r.name === json.reader);
      const lastPresentCard = items.find((i) => i.UID === reader.lastUIDPresent);

      if (lastPresentCard && (now - lastPresentCard.lastUpdatedTime > timeThreshold)) {
        if (item.presentCounts === 0) {
          console.log(item.UID)
          item.lastUpdatedTime = now;
          item.presentCounts++;
        } else if (now - item.lastUpdatedTime < timeThreshold) {
          item.presentCounts++;
          item.lastUpdatedTime = now;
        }
        console.log(lastPresentCard)
      }
    }
    item.isPresent = item.presentCounts > 3 ? false : true;
    item.isHighlighted = (json.reader === "Reader 5") ? item.isPresent : false;

    if (item.isPresent) {
      const reader = readers.find((r) => r.name === json.reader);
      if (reader) {
        reader.lastUIDPresent = item.UID;
      }
    }
  });

  // items[0].isPresent = true;
  // items[1].isPresent = true;
  items[2].isPresent = true;
  // items[3].isPresent = true;


  //lets try to update the section only for 1 reader
  if (json.reader === "Reader 5") {

    const areAllPresent = items.every(i => i.isPresent);
    // const someAbsent = items.some(i => !i.isPresent);
    // console.log(areAllPresent, someAbsent)
    const highlightIsActive = items.some(i => i.isHighlighted);
    console.log(areAllPresent, highlightIsActive)


    if (areAllPresent && !highlightIsActive) {
      //if all are present on the initial readers, we start
      currentState = states[0];
    }
    if (!areAllPresent && !highlightIsActive) {
      //if at least one is absent, but not on the highlight yet, we're in between
      currentState = states[1];
    } if (highlightIsActive) {
      //if the highlight is active, we're in the content
      currentState = states[2];
    }

    updateSectionDisplay(currentState.section, items);
  }


  $circle1.style.backgroundColor = items[0].isPresent ? "green" : "red";
  $circle2.style.backgroundColor = items[1].isPresent ? "green" : "red";
  $circle3.style.backgroundColor = items[2].isPresent ? "green" : "red";
  $circle4.style.backgroundColor = items[3].isPresent ? "green" : "red";
  $circle5.style.backgroundColor = items[0].isHighlighted ? "green" : "red";

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
