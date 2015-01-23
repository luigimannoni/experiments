var mouseX = 0, mouseY = 0, composer, controls;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0x000000, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.TrackballControls( camera );
controls.target = scene.position;

// Mesh
var group = new THREE.Group();
scene.add(group);

// Lights
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var whiteLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
whiteLight.position.set( 0, 128, 128 );
scene.add( whiteLight );

var redLight = new THREE.DirectionalLight( 0xff0000, 0.2 );
redLight.position.set( 0, 128, 128 );
scene.add( redLight );

camera.position.z = -120;
//camera.lookAt(scene.position);

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
    opacity: 0.5,
    alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
    side: THREE.DoubleSide, 
    depthWrite: false, 
    depthTest: false,
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
    opacity: 0.5,
    alphaMap: THREE.ImageUtils.loadTexture( 'javascripts/twirlalphamap.jpg' ),
    side: THREE.DoubleSide, 
    depthWrite: false, 
    depthTest: false,
  })
);
scene.add(sphereGlassOuter);

// Sphere Core
var sphereCore = new THREE.Mesh(
  new THREE.SphereGeometry( 20, 32, 32 ),
  new THREE.MeshPhongMaterial({ 
    color: 0x1111ff,
    ambient: 0x000022,
    shininess: 0,
  })
);
scene.add(sphereCore);

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


var particlesOuter = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
  size: 1.5,
  color: 0xff2222,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
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


var particlesInner = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
  size: 1,
  color: 0x9090ff,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
  transparent: true,
  })
);
scene.add(particlesInner);


var renderModel = new THREE.RenderPass( scene, camera );
var effectBloom = new THREE.BloomPass( 2.5, 2, 0.01, 1024 );
var effectFilm = new THREE.FilmPass( 0.9, 0.9, 2048, false );

effectFilm.renderToScreen = true;

composer = new THREE.EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectBloom );
composer.addPass( effectFilm );

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

  redLight.position.x = Math.cos(time.getElapsedTime()/0.5)*128;
  redLight.position.y = Math.cos(time.getElapsedTime()/0.5)*128;
  redLight.position.z = Math.sin(time.getElapsedTime()/0.5)*128;

  whiteLight.position.x = Math.cos(time.getElapsedTime()/20.5)*256;
  whiteLight.position.y = Math.cos(time.getElapsedTime()/20.5)*256;
  whiteLight.position.z = Math.sin(time.getElapsedTime()/20.5)*256;

  controls.update();

  //camera.lookAt(scene.position);

  //renderer.render(scene, camera);
  renderer.clear();
  composer.render(time.getElapsedTime());
  requestAnimationFrame(render);  

  console.log(camera.position);
};

render();


// Mouse and resize events
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  composer.reset();
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX - window.innerWidth/2;
  mouseY = event.clientY - window.innerHeight/2;
}