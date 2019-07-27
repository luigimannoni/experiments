const mouseX, mouseY, arcSpaceship;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x222222, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Mesh
const group = new THREE.Group();
const loader = new THREE.JSONLoader();

loader.load('arc170.json', function (geometry, materials) {

  const faceMaterial = new THREE.MeshFaceMaterial( materials );

  arcSpaceship = new THREE.Mesh(
    geometry,
    faceMaterial
  );

  arcSpaceship.receiveShadow = true;
  arcSpaceship.castShadow = true;

  // Grouping so I can play around later
  group.add(arcSpaceship);

  arcSpaceship.rotation.x += 1.005;

});

scene.add(group);
// Lights
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
directionalLight.position.set( 1, 1, 1 );
scene.add( directionalLight );
camera.position.z = 1;


const time = new THREE.Clock();

const render = function () {  
  //group.rotation.x += 0.005;
  //group.rotation.y += 0.005;
  //group.rotation.z += 0.005;

  
  camera.position.x = mouseX * 0.005;
  camera.position.y = -mouseY * 0.005;
  camera.lookAt(group.position);

  renderer.render(scene, camera);
  requestAnimationFrame(render);  
};

render();


// Mouse and resize events
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX - window.innerWidth/2;
  mouseY = event.clientY - window.innerHeight/2;
}