// Init
var container, stats;
var camera, scene, renderer, particles, geometry = [], materials = [],
    parameters, i, h, color, size;
var mouseX = 0,
    mouseY = 0;

var scene = new THREE.Scene();
//var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);

var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

THREE.ImageUtils.crossOrigin = "";
scene.fog = new THREE.FogExp2(0x000000, 1.5)
geometry[0] = new THREE.Geometry();

// First spiral
for (i = 0; i < 5000; i++) {
  var vertex = new THREE.Vector3();
  vertex.x = Math.sin(i/100)*25;
  vertex.y = i/5;
  vertex.z = Math.cos(i/100)*25;
  geometry[0].vertices.push(vertex);
}


parameters = [
  [[1, 1, 0.5], 2],
  [[0.98, 1, 0.5], 2],  
  [[0.8, 1, 0.5], 2]  
];


color = parameters[0][0];
materials[0] = new THREE.PointCloudMaterial({
  size: 1
});
particles = new THREE.PointCloud(geometry[0], materials[0]);
particles.position.y = -400;
scene.add(particles);


// Second spiral
geometry[1] = new THREE.Geometry();
for (i = 0; i < 5000; i++) {
  var vertex = new THREE.Vector3();
  vertex.x = Math.sin(i/100)*25;
  vertex.y = i/5;
  vertex.z = Math.cos(i/100)*25;
  geometry[1].vertices.push(vertex);
}

color = parameters[1][0];
materials[1] = new THREE.PointCloudMaterial({
  size: 1
});
particles = new THREE.PointCloud(geometry[1], materials[1]);
particles.position.y = -460;
scene.add(particles);


// Particles
geometry[2] = new THREE.Geometry();
for (i = 0; i < 5000; i++) {
  var vertex = new THREE.Vector3();
  vertex.x = Math.random()*2000-1000;
  vertex.y = Math.random()*2000-1000;
  vertex.z = Math.random()*2000-1000;
  geometry[2].vertices.push(vertex);
}
color = parameters[2][0];
materials[2] = new THREE.PointCloudMaterial({
  size: 3
});
particles = new THREE.PointCloud(geometry[2], materials[2]);
particles.position.y = -460;
scene.add(particles);

camera.position.z = -150;

// Second spiral

//var time = new THREE.Clock();
var render = function() {

  var time = Date.now() * 0.00005;
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  for (i = 0; i < scene.children.length; i++) {
    var object = scene.children[i];
    if (object instanceof THREE.PointCloud) {
      object.rotation.y = time;
    }
  }
  for (i = 0; i < materials.length; i++) {
    color = parameters[i][0];
    h = (360 * (color[0] + time) % 360) / 360;
    materials[i].color.setHSL(h, color[1], color[2]);
  }
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