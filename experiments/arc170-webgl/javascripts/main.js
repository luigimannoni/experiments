var mouseX, mouseY, arcSpaceship;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x222222, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Mesh
var group = new THREE.Group();
var loader = new THREE.JSONLoader();

loader.load('javascripts/arc170.json', function (geometry, materials) {
  var material = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('javascripts/arc170.jpg'),   
    colorAmbient: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
  });

  var faceMaterial = new THREE.MeshFaceMaterial( materials );

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
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
directionalLight.position.set( 1, 1, 1 );
scene.add( directionalLight );
camera.position.z = 3;

var time = new THREE.Clock();

var render = function () {  
  group.rotation.x += 0.005;
  group.rotation.y += 0.005;
  group.rotation.z += 0.005;

  
  camera.position.x = mouseX * 0.005;
  camera.position.y = -mouseY * 0.005;
  camera.lookAt(plane.position);

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