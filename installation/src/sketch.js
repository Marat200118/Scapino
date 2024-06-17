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

  // Create a constraints object.
  let constraints = {
    video: {
      deviceId: {
        // exact: "96c2072b9328179c2a7d2caf70c904b7ab4a385618888b74319a72eb8a8f208d"
        exact: "38541c9ce703c61da8138727db8df1e466b9c8850a167b15d634ab791bb2fb0b"
      },
    },
    audio: false
  };

  // Create the video capture.
  createCapture(constraints);
  // Capture the video
  video = createCapture(constraints, { flipped: true });
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

