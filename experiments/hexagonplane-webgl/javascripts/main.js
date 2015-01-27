function deg2rad(_degrees) {
  return (_degrees * Math.PI / 180);
}

var mouseX = 0, mouseY = 0, composer, controls;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);
scene.fog = new THREE.Fog(0x000000, 150, 650);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0x000000, 0 ); // background
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls = new THREE.TrackballControls( camera );
//controls.target.x = 500;
//controls.target.y = 500;
//controls.target = scene.position;

var group = new THREE.Group();
scene.add( group );

// Lights
var light = new THREE.AmbientLight( 0x909090 ); // soft white light
scene.add( light );

// Mesh
var whiteLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
whiteLight.position.set( 0, 128, 128 );
scene.add( whiteLight );


// Torus
var torusRadius = 15, torusTubeDiameter = 4, torusRows = 50, torusColumns = 50, torusVerticalPadding = 6, torusHorizontalPadding = 2, toruses = [];
var torusGeometry = new THREE.TorusGeometry( torusRadius, torusTubeDiameter, 2, 6 );
var torusMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x2C75FF,
    ambient: 0x2C75FF,
    transparent: false, 
    shininess: 0
  });

for (var column = 0; column < torusColumns; column++) {
  for (var row = 0; row < torusRows; row++) {
    
    var torus = new THREE.Mesh(torusGeometry, torusMaterial);
    var torusOffset = 0;
    if((column%2) == 1) {
      torusOffset = torusRadius + torusTubeDiameter;
    }

    torus.position.x = ( column * (torusRadius*2) + (torusTubeDiameter*2) ) + (torusHorizontalPadding * column);
    torus.position.y = (( row * (torusRadius*2) + (torusTubeDiameter*2) ) + (torusVerticalPadding * row)) + torusOffset;

    group.add(torus);

    toruses.push(torus);    
  }
}

camera.lookAt(scene.position);
camera.position.z = -45;
camera.position.x = 750;
camera.position.y = 750;
camera.rotation.x = deg2rad(95);
camera.rotation.z = deg2rad(180);

var time = new THREE.Clock();
var rowCounter = 0;

var render = function () {  
  var startTorus = rowCounter * torusRows;
  var endTorus = (torusColumns - 1) + (rowCounter * torusRows);
  
  for (var i = startTorus; i <= endTorus; i++) {
    toruses[i].position.z = Math.sin(Date.now()) * 10;
  }
  
  
  rowCounter++;
  if (rowCounter >= torusRows) {
    rowCounter = 0;
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