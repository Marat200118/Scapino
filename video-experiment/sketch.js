// based on:
// https://editor.p5js.org/DAI2020/sketches/FAI47hWdr
//

let video;
let gridSize = 10;
let videoTiles = [];

let poseNet;
let pose;

class VideoTile {
  constructor(x, y, sizeX, sizeY) {
    this.position = createVector(x, y);
    this.target = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.size = createVector(sizeX, sizeY);
    this.spring = 0.03;
    this.damping = 0.9;
  }

  update() {
    let force = p5.Vector.sub(this.target, this.position);
    force.mult(this.spring);
    this.acceleration.add(force);
    this.velocity.add(this.acceleration);
    this.velocity.mult(this.damping);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  display(vid) {
    push();
    translate(this.position.x, this.position.y);
    beginClip();

    circle(0, 0, this.size.x / 5);
    endClip();
    // image(vid, -60, -60, this.size.x, this.size.y, this.target.x, this.target.y);
    image(
      vid,
      -this.size.x * 0.1,
      -this.size.y * 0.2,
      this.size.x,
      this.size.y,
      this.target.x,
      this.target.y,
      this.size.x,
      this.size.y
    );
    stroke(255, 255, 255);
    strokeWeight(2);
    noFill();
    circle(0, 0, this.size.x * 0.2 - 2);
    pop();
  }
}

function setup() {
  let canvasHeight = windowHeight;
  let canvasWidth = windowWidth;

  // createCanvas(canvasWidth, canvasHeight, WEBGL);
  createCanvas(canvasWidth, canvasHeight);

  // videoSize = canvasHeight / gridSize;
  // videoMaxSize = videoSize * 2;

  // Initialize webcam video
  video = createCapture(VIDEO);
  let aspectRatio = video.width / video.height;
  video.hide();

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // let tileSize = random(20,200);
      let x = random(0, canvasWidth);
      let y = random(0, canvasHeight / 2);
      let sizeX = random(100, 400);
      let sizeY = sizeX / aspectRatio;
      videoTiles.push(new VideoTile(x, y, sizeX, sizeY));
    }
  }
  // Initialize PoseNet model and set the pose detection callback
  poseNet = ml5.poseNet(video, () => console.log("PoseNet model loaded"), true);
  poseNet.on("pose", (poses) => {
    if (poses.length > 0) {
      pose = poses[0].pose;
    }
  });
}

function draw() {
  background(0);
  // orbitControl();

  if (!pose) return;

  let referencePoint = createVector(pose.nose.x, pose.nose.y);
  let mouseDistMax = dist(0, 0, windowWidth, windowHeight);

  for (let tile of videoTiles) {
    let d = dist(
      tile.position.x,
      tile.position.y,
      referencePoint.x,
      referencePoint.y
    );

    let scaleFactor = map(d, 0, mouseDistMax, 50, 20);

    if (d < scaleFactor) {
      let force = createVector(
        referencePoint.x - tile.position.x,
        referencePoint.y - tile.position.y
      );
      force.normalize();
      force.mult(10);
      tile.acceleration.add(force);
    }

    tile.update();
    tile.display(video);
  }
}

function maskTorus() {
  push();
  rotateX(frameCount * 0.01);
  rotateY(frameCount * 0.01);
  scale(5);
  torus(30, 15);
  pop();
}
