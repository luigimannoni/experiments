var mouseX = 0, mouseY = 0;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var innerColor = 0xff0000,
    outerColor = 0xff9900;
var innerSize = 55,
    outerSize = 60;    

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0xffffff ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Image Loader obj
var imageLoader = new THREE.TextureLoader();
imageLoader.setCrossOrigin('anonymous');

var alpha = {
  stripe2px: imageLoader.load( '//luigimannoni.github.io/assets/alpha-2px-stripe.png' ),
  world: imageLoader.load( '//luigimannoni.github.io/assets/alpha-world.png' ),
};

alpha.stripe2px.wrapT = alpha.stripe2px.wrapS = THREE.RepeatWrapping;
alpha.stripe2px.repeat.set( 1, 2 );

alpha.world.wrapT = alpha.world.wrapS = THREE.RepeatWrapping;
alpha.world.repeat.set( 1, 1 );



// Grouped Mesh
var globe = new THREE.Group();
scene.add(globe);

// Lights
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 128, 128 );
scene.add( directionalLight );

// Red Dash
var sphereRedDash = new THREE.Mesh(
  new THREE.SphereGeometry( innerSize, 32, 32 ),
  new THREE.MeshLambertMaterial({ 
    color: 0xff0000,
    ambient: 0xff0000,
    transparent: true, 
    alphaTest: 0.99,
    alphaMap: alpha.stripe2px,
    shininess: 0,
    side: THREE.DoubleSide,
  })
);
globe.add(sphereRedDash);

// World
var sphereWorld = new THREE.Mesh(
  new THREE.IcosahedronGeometry( innerSize, 4 ),
  new THREE.MeshLambertMaterial({ 
    color: 0xff0000,
    ambient: 0xff0000,
    transparent: true, 
    alphaTest: 0.5,
    alphaMap: alpha.world,
    shininess: 0,
    side: THREE.DoubleSide,
  })
);
globe.add(sphereWorld);



camera.position.z = -110;
camera.lookAt(scene.position);
var time = new THREE.Clock();

var render = function () {  

  var innerShift = Math.abs(Math.cos(( (time.getElapsedTime()+2.5) / 20)));
  var outerShift = Math.abs(Math.cos(( (time.getElapsedTime()+5) / 10)));

  alpha.stripe2px.offset.y = time.getElapsedTime() / 2;
  alpha.world.offset.x = -1 * (time.getElapsedTime() / 60);
  //alpha.world.offset.y = time.getElapsedTime() / 20;

  renderer.render(scene, camera);
  requestAnimationFrame(render);  
};

render();


// Events
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
