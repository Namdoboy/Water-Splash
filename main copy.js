import { BoxBufferGeometry,Color,Mesh,MeshStandardMaterial,MeshPhongMaterial,PerspectiveCamera,Scene,WebGLRenderer,DirectionalLight,Raycaster,Vector2, AmbientLight,
} from './libs/threejs/build/three.module.js'
import { OrbitControls } from './libs/threejs/examples/jsm/controls/OrbitControls.js'


// Global Variables
let container, scene, camera, lightD1, lightD2, renderer, controls, raycaster, mouse;

function main() {
  init();
  animate(); 
}

///// INIT (basically the p5.js setup function) /////
function init() {

  // get a reference to the container element that will hold our scene
  container = document.querySelector('#scene-container');

  // create a Scene
  scene = new Scene();

  // set the background color of the scene
  // (set this to be the same background color of the container)
  scene.background = new Color('pink');

  // create camera
  const fov = 35; // field of view
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1; // the near clipping plane
  const far = 100; // the far clipping plane
  camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-10, -10, 30);

  // create lights
  lightD1 = new DirectionalLight('skyblue', 6);
  lightD1.position.set(10, 10, 10);
  
  lightD2 = new DirectionalLight('purple', 3);
  lightD2.position.set(-10, -10, -10);
  scene.add(lightD1, lightD2);

  // create raycaster for clicking on objects
  raycaster = new Raycaster();

  // create a variable to store the mouse position
  mouse = new Vector2();

  // initialize our renderer (set antialiasing to false if your page is too slow)
  renderer = new WebGLRenderer({ antialias: true });
  renderer.physicallyCorrectLights = true;
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.append(renderer.domElement);
  renderer.render(scene, camera);

  // initialize 3D controls (to click and drag around the scene)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;

  // create 50 cubes with random positions and sizes
  for(let i = 0; i < 50; i++) {
    let randomX = Math.random()*10 - 5;
    let randomY = Math.random()*10 - 5;
    let randomZ = Math.random()*10 - 5;
    let randomSize = Math.random()*2 + 0.25;
    createCube(randomX, randomY, randomZ, randomSize);
  }
}

/////// ANIMATE (basically the p5.js draw loop) /////
function animate(){
  controls.update();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate)
}

///// EVENT LISTENERS /////
window.addEventListener("resize", resizeCanvas)
window.addEventListener("click", selectObject.bind(null, true))
window.addEventListener("mousemove", selectObject.bind(null, false))

///// FUNCTIONS /////
function createCube(_x, _y, _z, _size) {
  const geometry = new BoxBufferGeometry(.5, .5, .5);
  const material = new MeshPhongMaterial({color: "white"});
  const cube = new Mesh(geometry, material);
  cube.position.set(_x, _y, _z);
  cube.scale.set(_size, _size, _size);
  scene.add(cube);
}

function resizeCanvas() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.render(scene, camera);
}

function selectObject(clicked, event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);
  if(intersects.length > 0) {
    const object = intersects[0].object;
    if(clicked){
      if(object.name != "clicked"){
        object.name = "clicked";
        object.material.color.set(0x8888ff);
      } else {
        object.name = "";
        object.material.color.set(0xaaffaa);
      }
    } else {
      if(object.name != "clicked") {
        object.material.color.set(0x88ff88);
      }
    }
  }
}

///// RUN THE SKETCH /////
main();