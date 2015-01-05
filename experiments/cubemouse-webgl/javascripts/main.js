var mouseX = 0,
    mouseY = 0;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var cubecam = new THREE.CubeCamera(0.1, 120, 256);
cubecam.renderTarget.minFilter = THREE.LinearMipMapLinearFilter; // mipmap filter
scene.add(cubecam);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
var geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.ShaderMaterial( {
  uniforms: {
      normalMap: { type: 't', value: null },
      textureMap: { type: 't', value: null },
      normalScale: { type: 'f', value: 5 },
      texScale: { type: 'f', value: 1 },
      useSSS: { type: 'f', value: 1 },
      useScreen: { type: 'f', value: 0 },
      color: { type: 'c', value: new THREE.Color( 220/255, 22/255, 22/255 ) }
  },
  vertexShader: document.getElementById( 'vertexShader' ).textContent,
  fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
  side: THREE.DoubleSide
  
} );
var cube = new THREE.Mesh(geometry, material);

// Cube Outline
var materialOutline = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
var cubeOutline = new THREE.Mesh( geometry, materialOutline );
cubeOutline.position = cube.position;
cubeOutline.scale.multiplyScalar(1.1);

// Group Everything
var group = new THREE.Object3D();
group.add(cube);
group.add(cubeOutline);
scene.add(group);

// Starting rotation
group.rotation.x += 25*(Math.PI/180);
group.rotation.y += -45*(Math.PI/180);

// Lights
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
directionalLight.position.set( 1, 1, 1 );
scene.add( directionalLight );
camera.position.z = 3;

// Sphere
var geometry = new THREE.SphereGeometry(0.3, 16, 16);
var material = new THREE.MeshBasicMaterial( { 
  color: 0xffffff,
  envMap: cubecam.renderTarget
} );

var sphere = new THREE.Mesh(geometry, material);
scene.add( sphere );

var sphereGeometry = new THREE.SphereGeometry( 101, 64, 64 );
var wallMaterial = new THREE.MeshBasicMaterial( { 
  color: 0x222222,
  side: THREE.BackSide 
} );

var sphereOut = new THREE.Mesh(
  sphereGeometry, wallMaterial
);
scene.add(sphereOut);

var sphereWF = new THREE.Mesh(
  new THREE.SphereGeometry( 100, 128, 128 ),
  new THREE.MeshBasicMaterial({ 
    color: 0x1a1a1a,
    wireframe: true, 
    side: THREE.BackSide 
  })
);
scene.add(sphereWF);

var time = new THREE.Clock();

var render = function () {  
  group.rotation.x += 0.005;
  group.rotation.y += 0.005;
  group.rotation.z += 0.005;

  camera.position.x = mouseX * 0.005;
  camera.position.y = -mouseY * 0.005;
  camera.lookAt(group.position);

  sphere.position.x = Math.cos(time.getElapsedTime()/0.5)*2;
  sphere.position.z = Math.sin(time.getElapsedTime()/0.5)*2;

  cubecam.position.x = Math.cos(time.getElapsedTime()/0.5)*1;
  cubecam.position.z = Math.sin(time.getElapsedTime()/0.5)*1;
  
  sphere.visible = false;
  cubecam.updateCubeMap( renderer, scene );
  sphere.visible = true;

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