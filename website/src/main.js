import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */

// Debug
// const gui = new GUI()

// Preloader
const preloader = document.getElementById('preloader');
const preloaderImg = document.querySelector('.preloader__demon');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#1C1815');

const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let model

const renderModel = (modelName, scale, y) => {
  const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  scale = width > 768 ? scale * 1.5 : scale
  gltfLoader.load(
    `../models/${modelName}.glb`,
    (gltf) => {
      model = gltf.scene
      model.position.x = 0
      model.position.y = y
      model.position.z = -0.5
      model.scale.set(scale, scale, scale)
      scene.add(model)
    }
  )
}

//checking if url contains a model topic and render the model accordingly:
const url = window.location.href;

switch (true) {
  case url.includes('misogyny'):
    renderModel('comb', 9, 0)
    break;
  case url.includes('life'):
    renderModel('plaster', 0.005, -0.5)
    break;
  case url.includes('societal'):
    renderModel('camera', 3, -0.5)
    break;
  case url.includes('reproductive'):
    renderModel('test', 12, 0)
    break;
  default:
    renderModel('test', 12, 0)
}


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Lihjts
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)

const pointLightColor = {
  color: 0xffffff
}

const pointLight = new THREE.PointLight(0xffffff, 90)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4

scene.add(pointLight)

//add lights to gui:
// const lightsFolder = gui.addFolder('Lights')
// lightsFolder.add(ambientLight, 'intensity').min(0).max(10).step(0.01).name('Ambient light intensity')
// lightsFolder.add(pointLight, 'intensity').min(0).max(100).step(0.01).name('Point light intensity')

//add color of point light to gui:

// lightsFolder.addColor(pointLightColor, 'color').onChange(() => {
//   pointLight.color.set(pointLightColor.color)
// }
// )

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  if (model) {
    preloader.style.display = 'none';
    switch (true) {
      case url.includes('misogyny'):
        model.rotation.y = -elapsedTime * 0.5
        model.rotation.x = -elapsedTime * 0.3
        break;
      case url.includes('life'):
        model.rotation.y = -elapsedTime * 0.5
        break;
      case url.includes('societal'):
        model.rotation.y = -elapsedTime * 0.5
        break;
      case url.includes('reproductive'):
        model.rotation.y = -elapsedTime * 0.5
        model.rotation.x = -elapsedTime * 0.3
        break;
      default:
        model.rotation.y = -elapsedTime * 0.5
        model.rotation.x = -elapsedTime * 0.3
    }


  } else {
    //preloader logic:
    preloader.style.display = 'flex';
    preloaderImg.src = `./svg/demon${(Math.floor((elapsedTime * 6) % 4)) + 1}.svg`;
    console.log(preloaderImg.src);
  }

  // Update controls, leaving it here in case of debugging
  // controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()