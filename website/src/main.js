import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#1C1815');

const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
let model

const renderModel = (modelName) => {
  gltfLoader.load(
    `/models/${modelName}.glb`,
    (gltf) => {
      model = gltf.scene
      model.position.x = -0.25
      model.position.y = -0.5
      model.position.z = -1.5
      scene.add(model)
    }
  )
}

renderModel('chihuahua');


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/15.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace



const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
const donutMaterial = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture
})

// for (let i = 0; i < 100; i++) {

//   const donut = new THREE.Mesh(donutGeometry, donutMaterial)
//   donut.position.x = (Math.random() - 0.5) * 10
//   donut.position.y = (Math.random() - 0.5) * 10
//   donut.position.z = (Math.random() - 0.5) * 10

//   donut.rotation.x = Math.random() * Math.PI
//   donut.rotation.y = Math.random() * Math.PI

//   const scale = Math.random()
//   donut.scale.set(scale, scale, scale)
//   scene.add(donut)
// }

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

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 30)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4

scene.add(pointLight)


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
    model.rotation.z = elapsedTime * 0.1
    model.rotation.y = -elapsedTime * 0.15
  }

  // Update controls
  // controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()