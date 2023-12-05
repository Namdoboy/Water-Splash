import {
  BoxBufferGeometry, Color, Mesh, MeshStandardMaterial, MeshNormalMaterial, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer, DirectionalLight, Raycaster, Vector2, AmbientLight
} from './libs/threejs/build/three.module.js'
import { OrbitControls } from './libs/threejs/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from './libs/threejs/examples/jsm/loaders/STLLoader.js'


// Global Variables
let container, scene, camera, lightD1, lightD2, renderer, controls, raycaster, mouse;

let contract;
let signer;
let contractWithSigner;

async function main() {

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, contractABI, provider);
  contractWithSigner = contract.connect(signer);

  // ADD YOUR CODE BELOW THIS LINE

  contract.on("ValueSet", (numScreenshots) => {
    takeScreenshot(renderer, window.innerWidth, window.innerHeight);
    console.log("Total screenshots: " + numScreenshots);
  })
  init();
  animate();
}

function handleKeyPress() {
  // 아무 키를 눌렀을 때 호출되는 함수
  anyKeyCounter++;

  // 아무 키가 30번 눌리면 스크린샷 찍기
  if (anyKeyCounter === 5) {
    contractWithSigner.set();
  }
}

///// INIT (basically the p5.js setup function) /////
function init() {

  // get a reference to the container element that will hold our scene
  container = document.querySelector('#scene-container');

  // create a Scene
  scene = new Scene();

  // set the background color of the scene
  // (set this to be the same background color of the container)
  scene.background = new Color('black');

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

  lightD2 = new DirectionalLight('white', 6);
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
  // for(let i = 0; i < 50; i++) {
  //   let randomX = Math.random()*10 - 5;
  //   let randomY = Math.random()*10 - 5;
  //   let randomZ = Math.random()*10 - 5;
  //   let randomSize = Math.random()*2 + 0.25;
  //   createCube(randomX, randomY, randomZ, randomSize);
  // }
}

/////// ANIMATE (basically the p5.js draw loop) /////
function animate() {
  controls.update();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate)
}

///// EVENT LISTENERS /////
window.addEventListener("resize", resizeCanvas)
// window.addEventListener("click", selectObject.bind(null, true))
//window.addEventListener("mousemove", selectObject.bind(null, false))
window.addEventListener('keydown', renderSTL);
//window.addEventListener('click', renderSTL);

///// FUNCTIONS /////
function loadSTL(fileURL) {
  return new Promise((resolve, reject) => {
    var loader = new STLLoader();
    loader.load(fileURL, resolve, undefined, reject);
  });
}


function getRandomColor() {
  // Generate a random color in hexadecimal format
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function renderSTL() {
  // STL 파일들의 경로
  var stlFileURLs = [
    'water_splash2.stl',
    'water_splash3.stl',
    'water_splash4.stl',
    'water_splash6.stl',
    'water_splash7.stl',
    'water_splash8.stl',
    'water_splash9.stl',
    'water_splash10.stl',
    'water_splash11.stl',
    'water_splash5.stl'
  ];

  // 각 STL 파일을 비동기적으로 로드
  Promise.all(stlFileURLs.map(loadSTL))
    .then(geometries => {
      // 모든 파일이 로드되면 호출되는 부분
      geometries.forEach(geometry => {
        // 랜덤한 위치, 크기, 각도, 색상을 설정
        var materials = new MeshStandardMaterial({ color: getRandomColor() });
        var mesh = new Mesh(geometry, materials);
        mesh.position.set(Math.random() * 15 - 9, Math.random() * 10 - 4, Math.random() * 20 - 13);
        mesh.scale.setScalar(Math.random() * 1 + 0.5); // 범위에 맞게 조절
        mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        scene.add(mesh);
      });
    })
    .catch(error => {
      console.error('STL 파일 로딩 중 오류 발생:', error);
    });
}



// renderSTL 함수 호출
renderSTL();

///// 전역 변수 /////
let anyKeyCounter = 0;

///// 함수 /////
function takeScreenshot(renderer, width, height) {
  // 스크린샷을 렌더링할 캔버스 엘리먼트 생성
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // 2D 컨텍스트 생성
  const context = canvas.getContext('2d');

  // 현재 씬을 캔버스에 렌더링
  renderer.render(scene, camera);

  // WebGL 캔버스에서 2D 캔버스로 렌더링된 이미지 복사
  context.drawImage(renderer.domElement, 0, 0, width, height);

  // 캔버스 데이터를 이미지 URL로 변환
  const screenshotURL = canvas.toDataURL('image/png');

  // 이미지를 데스크탑에 다운로드
  const link = document.createElement('a');
  link.href = screenshotURL;
  link.download = 'screenshot.png';
  link.click();

  // 카운터 초기화
  anyKeyCounter = 0;
}




// 키다운 이벤트에 대한 이벤트 리스너 추가
document.addEventListener('keydown', handleKeyPress);


function createCube(_x, _y, _z, _size) {
  const geometry = new BoxBufferGeometry(.5, .5, .5);
  const material = new MeshPhongMaterial({ color: "white" });
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
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (clicked) {
      if (object.name != "clicked") {
        object.name = "clicked";
        object.material.color.set(0x8888ff);
      } else {
        object.name = "";
        object.material.color.set(0xaaffaa);
      }
    } else {
      if (object.name != "clicked") {
        object.material.color.set(0x88ff88);
      }
    }
  }
}

///// RUN THE SKETCH /////
main();