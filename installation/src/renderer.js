import './index.css';

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
    usbVendorId: 9025
};
let connectedArduinoPorts = [];

let writer;
const $r = document.getElementById("r");
const $g = document.getElementById("g");
const $b = document.getElementById("b");
const $nfc = document.querySelector("nfc-id");

const init = async () => {
    displaySupportedState();
    if (!hasWebSerial) return;
    displayConnectionState();
    navigator.serial.addEventListener('connect', (e) => {
        const port = e.target;
        const info = port.getInfo();
        console.log('connect', port, info);
        if (isArduinoPort(port)) {
            connectedArduinoPorts.push(port);
            if (!isConnected) {
                connect(port);
            }
        }
    });

    navigator.serial.addEventListener('disconnect', (e) => {
        const port = e.target;
        const info = port.getInfo();
        console.log('disconnect', port, info);
        connectedArduinoPorts = connectedArduinoPorts.filter(p => p !== port);
    });

    const ports = await navigator.serial.getPorts();
    connectedArduinoPorts = ports.filter(isArduinoPort);

    console.log('Ports');
    ports.forEach(port => {
        const info = port.getInfo();
        console.log(info);
    });
    console.log('Connected Arduino ports');
    connectedArduinoPorts.forEach(port => {
        const info = port.getInfo();
        console.log(info);
    });

    if (connectedArduinoPorts.length > 0) {
        connect(connectedArduinoPorts[0]);
    }

    $connectButton.addEventListener("click", handleClickConnect);

    $r.addEventListener("input", handleInput);
    $g.addEventListener("input", handleInput);
    $b.addEventListener("input", handleInput);
};

const isArduinoPort = (port) => {
    const info = port.getInfo();
    return info.usbProductId === arduinoInfo.usbProductId && info.usbVendorId === arduinoInfo.usbVendorId;
};

const handleClickConnect = async () => {
    const port = await navigator.serial.requestPort();
    console.log(port);
    const info = port.getInfo();
    console.log(info);
    await connect(port);
};

const connect = async (port) => {
    isConnected = true;
    displayConnectionState();

    await port.open({ baudRate: 9600 });

    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();

    while (port.readable) {
        const decoder = new TextDecoderStream();

        const lineBreakTransformer = new TransformStream({
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
        });

        const readableStreamClosed = port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable.pipeThrough(lineBreakTransformer);
        const reader = inputStream.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // |reader| has been canceled.
                    break;
                }
                // Do something with |value|...
                try {
                    console.log(value);
                    const json = JSON.parse(value);
                    console.log(json)
                    $nfc.textContent = `${json.message} ${json.data} `;
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            // Handle |error|...
            console.warn("Warning: An error occurred while reading from the stream", error);
        } finally {
            reader.releaseLock();
        }
    }

    port.addEventListener("disconnect", () => {
        console.log("Disconnected");
        isConnected = false;
        displayConnectionState();
    });
}

const handleInput = async () => {
    const r = parseInt($r.value);
    const g = parseInt($g.value);
    const b = parseInt($b.value);
    if (!isConnected) {
        return;
    }
    await writer.write(JSON.stringify({
        r,
        g,
        b,
    }));
    await writer.write("\n");
};

const displaySupportedState = () => {
    if (hasWebSerial) {
        $notSupported.style.display = "none";
        $supported.style.display = "block";
    } else {
        $notSupported.style.display = "block";
        $supported.style.display = "none";
    }
}

const displayConnectionState = () => {
    if (isConnected) {
        $notConnected.style.display = "none";
        $connected.style.display = "block";
    } else {
        $notConnected.style.display = "block";
        $connected.style.display = "none";
    }
}

init();