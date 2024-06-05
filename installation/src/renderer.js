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
        console.log("Received:", value);
        try {
          const json = JSON.parse(value);
          console.log(json);
          updateCircle(json);
        } catch (error) {
          console.log("Received non-JSON message:", value);
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
let lastUpdateTime = 0;
let lastUpdatedTime1 = 0;
let lastUpdatedTime2 = 0;
const timeThreshold = 1000;

const updateCircle = (json) => {
  const now = Date.now();
  // if (now - lastUpdateTime < timeThreshold) {
  //   return;
  // }

  if (json.UID !== "No card present") {
    if (json.reader === "Reader 1") {
      if (cardPresentCount1 === 0) {
        lastUpdatedTime1 = now;

        cardPresentCount1++;
      } else if (now - lastUpdatedTime1 < timeThreshold) {
        cardPresentCount1++;
        console.log(cardPresentCount1);
        lastUpdatedTime1 = now;
      }
    } else if (json.reader === "Reader 2") {
      if (cardPresentCount2 === 0) {
        lastUpdatedTime2 = now;
        cardPresentCount2++;
      } else if (now - lastUpdatedTime2 < timeThreshold) {
        cardPresentCount2++;
        console.log(cardPresentCount2);
        lastUpdatedTime2 = now;
      }
    }
  } else {
    if (now - lastUpdatedTime2 > timeThreshold) {
      cardPresentCount2 = 0;
      // console.log("here2");
    }
    if (now - lastUpdatedTime1 > timeThreshold) {
      console.log("here1");
      cardPresentCount1 = 0;
    }
    $circle2.style.backgroundColor = cardPresentCount2 > 5 ? "green" : "red";
    $circle1.style.backgroundColor = cardPresentCount1 > 5 ? "green" : "red";

    // cardPresentCount1=0;
    // cardPresentCount2=0;
    // console.log(cardPresentCount1);
    // $circle2.style.backgroundColor = "red";
  }

  //  if (json.UID !== "No card present") {
  //    cardPresentCount1++;
  // $circle1.style.backgroundColor = "red";
  //  } else if (json.reader === "Reader 2") {
  //    cardPresentCount2++;
  // $circle2.style.backgroundColor = "red";
  //    }
  //  }

  // else {
  //   $circle1.style.backgroundColor = "green";
  //   $circle2.style.backgroundColor = "green";
  // }
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
