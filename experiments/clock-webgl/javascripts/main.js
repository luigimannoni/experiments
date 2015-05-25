var mouseX, mouseY, loadedMesh, controls;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.setClearColor( 0xffffff, 0 ); // background
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Mesh
var group = new THREE.Group();
var hours = new THREE.Group();
var minutes = new THREE.Group();

var loader = new THREE.JSONLoader();
var dullMaterial = new THREE.MeshLambertMaterial( { color: 0x333333, ambient: 0x333333 } );

loader.load('javascripts/clockwall.json', function (geometry, materials) {

  loadedMesh = new THREE.Mesh(
    geometry,
    dullMaterial
  );

  loadedMesh.receiveShadow = true;
  loadedMesh.castShadow = false;

  group.add(loadedMesh);

});

loader.load('javascripts/clockface.json', function (geometry, materials) {

  loadedMesh = new THREE.Mesh(
    geometry,
    dullMaterial
  );

  loadedMesh.receiveShadow = false;
  loadedMesh.castShadow = true;

  group.add(loadedMesh);

});

loader.load('javascripts/clockhours.json', function (geometry, materials) {

  loadedMesh = new THREE.Mesh(
    geometry,
    dullMaterial
  );

  loadedMesh.receiveShadow = false;
  loadedMesh.castShadow = true;

  hours.position.z = -0.81;
  hours.add(loadedMesh);
});

loader.load('javascripts/clockminutes.json', function (geometry, materials) {

  loadedMesh = new THREE.Mesh(
    geometry,
    dullMaterial
  );

  loadedMesh.receiveShadow = false;
  loadedMesh.castShadow = true;

  minutes.position.z = -0.82;
  minutes.add(loadedMesh);
});
scene.add(hours);
scene.add(minutes);

scene.add(group);
// Lights
var light = new THREE.AmbientLight( 0x111111 ); // soft white light
scene.add( light );
/*
var directionalLight = new THREE.DirectionalLight( 0xeeeeee, 10 );
directionalLight.position.set( 0, 2, -10 );
directionalLight.castShadow = true;
scene.add( directionalLight );

var dirhelp = new THREE.DirectionalLightHelper(directionalLight, 10);
scene.add(dirhelp);*/
camera.position.z = 4;

var spotLight = new THREE.SpotLight( 0xffffff, 10 );
spotLight.position.set( 0, 8, -12.5 );

spotLight.shadowCameraNear  = 0.01;   
spotLight.castShadow    = true;
spotLight.shadowDarkness  = 1;
spotLight.shadowMapWidth = 1024;
spotLight.shadowMapHeight = 1024;

//spotLight.shadowCameraVisible = true;


scene.add( spotLight );

//var spothelp = new THREE.SpotLightHelper(spotLight, 5);
//scene.add(spothelp);

// Trackball camera
  controls = new THREE.TrackballControls( camera );
  controls.target = group.position;
  controls.minDistance = 4;
  controls.maxDistance = 2500;

var time = new THREE.Clock();

var chimeTout = false, bongTout = false;

var render = function () {  
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();
  if (h > 12) {
    h = h - 12;
  }

  hours.rotation.z = deg2rad( (360/(3600*12)) * ((3600*h) + (60*m) + s) );
  minutes.rotation.z = deg2rad( (360/3600) * ((60*m) + s) );

  if (m == 59 && s == 40 && chimeTout == false) {
    chimeTout = true;
    bell.play('chime');
  }

  if (m == 00 && s == 00 && bongTout == false) {
    bongTout = true;
    bell.play('bong');
    var bongCount = h;
    bongTout = setInterval(function(){
      bongCount--;
      if (bongCount > 0) {
        bell.play('bong');
      } 
      else {
        bongTout = false;
        chimeTout = false;  
      }
      
    }, 4000)
  }
  /*
  camera.position.x = mouseX * 0.00005;
  camera.position.y = -mouseY * 0.00005;
  camera.lookAt(group.position);*/
  //controls.update();


  renderer.render(scene, camera);
  requestAnimationFrame(render);  
};

render();

var ticking = new Howl({
  urls: ['javascripts/ticking.ogg'],
  loop: true,
  autoplay: true
});

var bell = new Howl({
  urls: ['javascripts/chimebong.ogg'],
  sprite: {
    chime: [0, 20955],
    bong: [20955, 14000]
  },
  onend: function() {
    //bongTout = false;
    //chimeTout = false;
  }
});


function deg2rad(_degrees) {
  return _degrees*(Math.PI/180);
}

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