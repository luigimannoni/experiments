var mouseX = 0, mouseY = 0;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var innerColor = 0xff0000,
    outerColor = 0xff9900;
var innerSize = 55,
    outerSize = 60;    

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0xffffff, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Image Loader obj
var imageLoader = new THREE.TextureLoader();
imageLoader.setCrossOrigin('anonymous');

// Grouped Mesh
var globe = new THREE.Group();
scene.add(globe);

// Lights
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 128, 128 );
scene.add( directionalLight );

// Sphere Wireframe Inner
var sphereRedDash = new THREE.Mesh(
  new THREE.SphereGeometry( innerSize, 2 ),
  new THREE.MeshLambertMaterial({ 
    color: 0xff0000,
    ambient: 0xff0000,
    transparent: true, 
    alphaTest: 0.5,
    alphaMap: imageLoader.load( '//luigimannoni.github.io/assets/alpha-4px-stripe.png' ),
    shininess: 0
  })
);
scene.add(sphereRedDash);



camera.position.z = -110;
camera.lookAt(scene.position);
var time = new THREE.Clock();

var render = function () {  

  var innerShift = Math.abs(Math.cos(( (time.getElapsedTime()+2.5) / 20)));
  var outerShift = Math.abs(Math.cos(( (time.getElapsedTime()+5) / 10)));

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
