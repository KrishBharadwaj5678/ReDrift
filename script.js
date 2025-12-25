import * as THREE from "three";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

let w = window.innerWidth;
let h = window.innerHeight;
// Scene Setup
let scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);
// Camera
let camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 2, 5);
// Renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Post-Processing
// Renders the scene from the camera’s point of view
let renderScene = new RenderPass(scene, camera);
// Adds a glow effect
let bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h));
bloomPass.threshold = 0;
bloomPass.strength = 3.0;
bloomPass.radius = 0;
// Controls rendering order
let composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

let squareGeo = new THREE.PlaneGeometry(1, 1);
let colors = [0xfe3508, 0x882121, 0x92505c, 0x300e22, 0x4f0505];

// Creating a Moving Square
function getSquare() {
  let x = Math.floor(Math.random() * 30) - 15.5;
  let y = Math.floor(Math.random() * 4);
  let z = Math.floor(Math.random() * -80) - 0.5;

  let basicMat = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    side: THREE.DoubleSide,
  });
  let mesh = new THREE.Mesh(squareGeo, basicMat);
  mesh.position.set(x, y, z);
  mesh.rotation.x = Math.PI * -0.5;

  // Movement Logic
  let limit = 45;
  let speed = 0.1;

  // mesh.userData is a built-in place to attach your own custom data or methods
  mesh.userData = {
    update() {
      mesh.position.z += speed;
      if (mesh.position.z > 4) {
        mesh.position.z = -limit;
      }
    },
  };

  return mesh;
}

// Creating Boxes
let boxes = Array(700).fill().map(getSquare);
boxes.forEach((b) => scene.add(b));

// Pause Control
let paused = false;

function handleKeyDown(evt) {
  let { key } = evt;
  if (key === "Escape") {
    paused = !paused;
  }
}
window.addEventListener("keydown", handleKeyDown);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    boxes.forEach((mesh) => mesh.userData.update());
    camera.rotation.z += 0.0006;
    composer.render(scene, camera);
  }
}
animate();

// Window Resize Handling
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleWindowResize, false);
