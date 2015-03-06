var mouseX = 0, mouseY = 0, composer, controls;
var postprocessing = { enabled : true };
var screenSpacePosition = new THREE.Vector3();
var sunPosition = new THREE.Vector3( 0, 120, 1000 );
var bgColor = 0x000000;
var sunColor = 0xffee00;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setClearColor( 0x000000, 0 ); // background
//renderer.autoClear = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.TrackballControls( camera );
controls.target = scene.position;
controls.minDistance = 120;
controls.maxDistance = 2500;
controls.noPan = true;

var materialDepth = new THREE.MeshDepthMaterial();
var materialScene = new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading } );

var geometry = new THREE.BoxGeometry( 5000, 5000, 5000 ); 
var materialArray = [];
var directions  = ['right1', 'left2', 'top3', 'bottom4', 'front5', 'back6'];
for (var i = 0; i < 6; i++) {
  materialArray.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'javascripts/bluenebula1024_' + directions[i] + '.png' ),
    side: THREE.BackSide
  }));
}
var material = new THREE.MeshFaceMaterial( materialArray );
var skybox = new THREE.Mesh( geometry, material );
scene.add( skybox );


// Lights
var light = new THREE.PointLight( 0xffffff, 10, 100 );
scene.add( light );

camera.position.z = -150;

// Sphere Wireframe Outer
var hexagonTexture = THREE.ImageUtils.loadTexture( 'javascripts/hexagongrid.jpg' );
hexagonTexture.wrapS = hexagonTexture.wrapT = THREE.RepeatWrapping;
hexagonTexture.repeat.set( 4, 2 );


var uniforms = {
  time:   { type: "f", value: 1.0 },
  scale:  { type: "f", value: 0.05 }
};

var planet = new THREE.Mesh(
  new THREE.SphereGeometry( 56, 32, 32 ), 
  new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexNoise' ).textContent,
    fragmentShader: document.getElementById( 'fragmentNoise' ).textContent
  })
);

scene.add(planet);



// Glow shader
var glow = new THREE.Mesh(
  new THREE.SphereGeometry( 60, 32, 32 ), 
  new THREE.ShaderMaterial( {
    uniforms: { 
      "c":   { type: "f", value: 1 },
      "p":   { type: "f", value: 6 },
      glowColor: { type: "c", value: new THREE.Color(0xff3300) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: document.getElementById( 'vertexGlow' ).textContent,
    fragmentShader: document.getElementById( 'fragmentGlow' ).textContent,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  })
);

scene.add(glow);

// Fake sun shader
var fakeSun = new THREE.Mesh(
  new THREE.SphereGeometry( 32, 32, 32 ), 
  new THREE.ShaderMaterial( {
    uniforms: { 
      "c":   { type: "f", value: 1 },
      "p":   { type: "f", value: 6 },
      glowColor: { type: "c", value: new THREE.Color(0xffffbb) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: document.getElementById( 'vertexGlow' ).textContent,
    fragmentShader: document.getElementById( 'fragmentGlow' ).textContent,
    //blending: THREE.AdditiveBlending,
    //transparent: true
  })
);
fakeSun.position.y = 500;
fakeSun.position.z = 500;

scene.add(fakeSun);

// Particles
var geometry = new THREE.Geometry();
for (i = 0; i < 128000; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 56.5,
         y * 56.5,
         z * 56.5
  );
   
  geometry.vertices.push(vertex);

}


var particlesOuter = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
  size: 0.5,
  color: 0xFF2C2C,
  sizeAttenuation: true,
  transparent: true,
  alphaTest: 0.2,
  })
);
//scene.add(particlesOuter);

// The smaller globes around...
var smallerGlobesGeometry = new THREE.Geometry();
for (i = 0; i < 5; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 70,
         y * 70,
         z * 70
  );
   
  smallerGlobesGeometry.vertices.push(vertex);

}
var smallerGlobes = new THREE.PointCloud(smallerGlobesGeometry, new THREE.PointCloudMaterial({
  size: 24,
  color: 0xffffff,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
  sizeAttenuation: true,
  alphaTest: 0.2,
  transparent: true,
  })
);
scene.add(smallerGlobes);

var renderModel = new THREE.RenderPass( scene, camera );
var effectGlitch = new THREE.GlitchPass( );

effectGlitch.renderToScreen = true;

composer = new THREE.EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectGlitch );

var time = new THREE.Clock();

var render = function () {
  
  uniforms.time.value += 0.02;  
  controls.update();
  
  planet.rotation.y += 0.002;
  particlesOuter.rotation.y += 0.001;
  smallerGlobes.rotation.y += 0.0005;
  
  renderer.clear();
  composer.render(time.getElapsedTime());

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

  composer.reset();
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX - window.innerWidth/2;
  mouseY = event.clientY - window.innerHeight/2;
}