var mouseX, mouseY, arcSpaceship;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor( 0x000000, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Mesh
var group = new THREE.Group();
scene.add(group);

// Lights
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 128, 128 );
scene.add( directionalLight );
camera.position.z = -120;
camera.position.x = 0;
camera.position.y = 0;
camera.lookAt(scene.position);

// Sphere Wireframe Inner
var sphereWireframeInner = new THREE.Mesh(
  new THREE.DodecahedronGeometry( 36, 2 ),
  new THREE.MeshLambertMaterial({ 
    color: 0xff0000,
    ambient: 0xff0000,
    wireframe: true,
    wireframeLinewidth: 3,
    transparent: true, 
    //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/alphamap.jpg' ),
    shininess: 0
  })
);
scene.add(sphereWireframeInner);

// Sphere Wireframe Outer
var sphereWireframeOuter = new THREE.Mesh(
  new THREE.DodecahedronGeometry( 56, 2 ),
  new THREE.MeshLambertMaterial({ 
    color: 0x2C75FF,
    ambient: 0x536878,
    wireframe: true,
    wireframeLinewidth: 0.5,
    transparent: true,
    //alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/alphamap.jpg' ),
    shininess: 0 
  })
);
scene.add(sphereWireframeOuter);


// Sphere Glass Inner
var sphereGlassInner = new THREE.Mesh(
  new THREE.SphereGeometry( 26, 32, 32 ),
  new THREE.MeshPhongMaterial({ 
    color: 0x2C75FF,
    ambient: 0x536878,
    transparent: true,
    shininess: 0,
    alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
    //side: THREE.BackSide
  })
);
scene.add(sphereGlassInner);

// Sphere Glass Outer
var sphereGlassOuter = new THREE.Mesh(
  new THREE.SphereGeometry( 46, 32, 32 ),
  new THREE.MeshPhongMaterial({ 
    color: 0xff0000,
    ambient: 0xff0000,
    transparent: true,
    shininess: 0,
    blending: THREE.Additive,
    alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
    //side: THREE.BackSide
  })
);
scene.add(sphereGlassOuter);

// Particles
var geometry = new THREE.Geometry();
for (i = 0; i < 1024; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 64,
         y * 64,
         z * 64
  );
   
  geometry.vertices.push(vertex);

}


var particlesOuter = new THREE.ParticleSystem(geometry, new THREE.ParticleBasicMaterial({
  size: 1.5,
  color: 0xff2222,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
  blending: THREE.AdditiveAlpha,
  transparent: true,
  })
);
scene.add(particlesOuter);

// Particles
var geometry = new THREE.Geometry();
for (i = 0; i < 1024; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 50,
         y * 50,
         z * 50
  );
   
  geometry.vertices.push(vertex);

}


var particlesInner = new THREE.ParticleSystem(geometry, new THREE.ParticleBasicMaterial({
  size: 1,
  color: 0x9090ff,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
  blending: THREE.AdditiveAlpha,
  transparent: true,
  })
);
scene.add(particlesInner);


var time = new THREE.Clock();

var render = function () {  
  sphereWireframeInner.rotation.x += 0.002;
  sphereWireframeInner.rotation.z += 0.002;
  
  sphereWireframeOuter.rotation.x += 0.001;
  sphereWireframeOuter.rotation.z += 0.001;
  
  sphereGlassInner.rotation.y += 0.005;
  sphereGlassInner.rotation.z += 0.005;

  sphereGlassOuter.rotation.y += 0.01;
  sphereGlassOuter.rotation.z += 0.01;

  particlesOuter.rotation.y += 0.0005;
  particlesInner.rotation.y -= 0.002;

  sphereWireframeInner.material.opacity = Math.abs(Math.cos((time.getElapsedTime()+0.5)/0.9)*0.5);
  sphereWireframeOuter.material.opacity = Math.abs(Math.cos(time.getElapsedTime()/0.9)*0.5);


  directionalLight.position.x = Math.cos(time.getElapsedTime()/0.5)*128;
  directionalLight.position.y = Math.cos(time.getElapsedTime()/0.5)*128;
  directionalLight.position.z = Math.sin(time.getElapsedTime()/0.5)*128;

  camera.position.x = mouseX * 0.05;
  camera.position.y = -mouseY * 0.05;
  camera.lookAt(scene.position);

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