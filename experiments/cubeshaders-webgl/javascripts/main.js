var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

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

// Plane 
var planeGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
var wallMaterial = new THREE.MeshBasicMaterial( { 
  color: 0x222222
} );

var plane = new THREE.Mesh(
  planeGeometry, wallMaterial
);
plane.position.z = -2;

scene.add(plane);
var time = new THREE.Clock();

var render = function () {  
  group.rotation.x += 0.005;
  group.rotation.y += 0.005;
  group.rotation.z += 0.005;
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);  
};

render();