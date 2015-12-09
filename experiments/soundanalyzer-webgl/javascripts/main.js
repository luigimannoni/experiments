/**
 * This script will only work on browsers with AudioContext and WebGL active, in short: get the latest Chrome.
 * IE11 at the time of writing does not support AudioContext, but it renders WebGL pretty good.
 * I know Safari (6) has WebGL issues and you might need to enable it on your settings/flags, also doesn't support AudioContext not sure of the latest.
 * Don't even think to run this on mobile Safari.
 * I haven't tested Firefox but unless you're running an ancient version I am pretty confident this works on FF too.
 * 
 * Built with Mrdoob's Threejs (http://threejs.org), keyboard and probably LSD.
 * Inspired from Michael Bromley's Soundcloud Visualizer (https://github.com/michaelbromley/soundcloud-visualizer)
 *
 * Below the well commented dark magic.
 *
 *
 * Allowed to fork, play with this, post it on your website, show to your mum as long you give credit to the original owners.
 *
 * Luigi Mannoni (http://luigimannoni.com)
 * Twitter: @mashermack 
 * More experiments on:
 * Codepen: http://codepen.io/luigimannoni
 * Github: https://github.com/luigimannoni/luigimannoni.github.io
 * Last update on 01/12/2015 - Refactored code
 * Last update on 18/06/2015 - Fixed CrossOrigin bug
 * Last update on 29/07/2015 - Added warning
 */

var player =  document.getElementById('player');

var audioCtx = new (window.audioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
var bufferLength = analyser.fftSize;
var dataArray = new Uint8Array(bufferLength);


var source = audioCtx.createBufferSource();
source.connect(analyser);
analyser.connect(audioCtx.destination);


var request = new XMLHttpRequest();
streamUrl = 'javascripts/275579f6d4e3fd7bccbb0db65119fe33.ogg';

request.open("GET", streamUrl, true);
request.responseType = "arraybuffer";

request.onload = function() { 
    audioCtx.decodeAudioData(
        request.response,
        function(b) {
            audioBuffer = b;

            source.buffer = audioBuffer;
            source.loop = true;

            source.start(0.0);
            document.getElementById('loading').style.display = 'none';
        },
        
        function(buffer) {
          document.getElementById('warning').style.display = 'block';          
        }
    );
}

request.send();




// Since I suck at trigonometry I'll just convert radii into degrees.
function deg2rad(_degrees) {
  return (_degrees * Math.PI / 180);
}

// Init values
var mouseX = 0, mouseY = 0, composer, controls;
var activeCamera = 0;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 5000);
scene.fog = new THREE.Fog(0x000000, 600, 1500);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0x000000, 0 ); // background
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ditching controls in favour of an automatic camera.
//controls = new THREE.TrackballControls( camera );

// I don't think we need this group, I used to rotate the entire group back then... just left there in case I want to reuse that again
var group = new THREE.Group();
scene.add( group );

// Ambient Light
var light = new THREE.AmbientLight( 0x909090 ); // soft white light
scene.add( light );

// Strobo plane
var planeGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
var planeMaterial = new THREE.MeshPhongMaterial( { 
  color: 0x111111,
  ambient: 0x000000,
} );

var plane = new THREE.Mesh(
  planeGeometry, planeMaterial
);
plane.position.y = -2;
plane.rotation.x = deg2rad(-90);

scene.add(plane);

// I'll create a matrix of cubes with the settings below.
var cubeDimension = 45, 
  cubeRows = 9, 
  cubeColumns = 9, 
  cubePadding = 3, 
  cubes = [], // Don't ask me why, but I needed to initialize this array. This will accomodate each single object
  cubesWireframe = [], // I clone the same object using a different material since I can't use multimaterials anymore, so yes, one cube are in reality two cubes.
  cubesLight = []; // Yes, the cubes used to cast lights and shadows until my machine exploded.
var cubeGeometry = new THREE.BoxGeometry(cubeDimension, 1, cubeDimension);

for (var column = 0; column < cubeColumns; column++) { // Column cycle
  for (var row = 0; row < cubeRows; row++) { // Row cycle
    
    // First cube
    var cube = new THREE.Mesh(cubeGeometry, 
      new THREE.MeshLambertMaterial({ // Note: I have to directly create the material object into the mesh, if I define the material before I can't change this indepedently.
          color: 0x2C75FF, // That's a blue colour, I used this to debug and just left.
          ambient: 0x2222c8,
          transparent: true,
          shininess: 85, 
          opacity: 0.05 // It will change on runtime anyway.
        }) 
      );
    
    cube.position.x = (column * cubeDimension) + (cubePadding * column); // Position it
    cube.position.z = (row * cubeDimension) + (cubePadding * row);

    group.add(cube); // Aaaaah, here it is, yes this should add into the scene the cube automatically
    cubes.push(cube); // And I add the cube into the array since I will be destroying this object shortly

    var cube = new THREE.Mesh(cubeGeometry, // Old cube var is gone by now, I use a new one to build the wireframe around it
      new THREE.MeshLambertMaterial({ 
          color: 0x2C75FF,
          ambient: 0x2222c8,
          transparent: false,
          wireframe: true,
          wireframeLinewidth: 4 // Take note: this does NOT work on Windows machines :(
        }) // Same as before
      );

    cube.position.x = (column * cubeDimension) + (cubePadding * column);
    cube.position.z = (row * cubeDimension) + (cubePadding * row);

    group.add(cube); // See above

    cubesWireframe.push(cube);  // See above

  }
}

camera.position.z = -65; 
camera.position.y = 65; // Some initial positioning of the camera, it will be rewritten on runtime

// Some post processing, fiddle around with these values to give it different FX
var renderModel = new THREE.RenderPass( scene, camera );
var effectBloom = new THREE.BloomPass( 1.5, 2, 0.01, 1024 );
var effectFilm = new THREE.FilmPass( 0.3, 0.3, 1024, false );

// Applying composer
effectFilm.renderToScreen = true;

composer = new THREE.EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectBloom );
composer.addPass( effectFilm );


var time = new THREE.Clock();
var centerCube = 40;
var beat = false;
// Render function

var data = {
  volumeHi: 0,
  volumeLow: 0,
  streamData: [0, 0],
  mental: 0,
  threshold: 75,
  avgVolume: 0,
  camera: 0,
  autocam: true
};

// Dat.GUI
var gui = new dat.GUI();

gui.add(data, "mental").min(0).max(100).step(1).listen();
gui.add(data, "threshold").min(0).max(100).step(1).listen();
gui.add(data, "camera").min(0).max(2).step(1).listen();
gui.add(data, "avgVolume").listen();
gui.add(data, "autocam");


var render = function () {  
  data.avgVolume = 0;
  for (var i = 0; i < 128; i++) { // Get the volume from the first 128 bins
    data.avgVolume += dataArray[i];
  }
  data.mental = (Math.min(Math.max((Math.tan( (data.avgVolume/(255*128) * 1.8) ) * 0.5)), 2)) * 100; 

  cameraRender();


  if (audioCtx) {
    analyser.getByteFrequencyData(dataArray);
    
    //console.log(dataArray[0]);

    // I recycled the mental var, this should go from 0 to 1 and jumps in between with the music
    // It's not an ideal beat detector but it works!

    

    //console.log(avgVolume, mental);


    for (var i = dataArray.length - 1; i >= 0; i--) {
      // My error here is: I am still doing a full cycle for the streamData array while I should pick only as many channel as my cube matrix
      // I have left this just in case I wanted to increase the data channels
      if(!!cubes[i]) { // Need to save javascript into crashing

        var currentAudioChannelVolume = dataArray[i]; // Makes more sense than streamData

        cubes[i].scale.y = (currentAudioChannelVolume + 0.1) / 3; // Makes cube taller with the volume
        cubes[i].position.y = ((currentAudioChannelVolume + 0.1) / 3) / 2; // Since scale works in 2 ways (Y axis and -Y axis) I compensate by applying half position onto the Y axis

        cubes[i].scale.x = ( 1 / 255 * (255 - (currentAudioChannelVolume/1.5)) ); // Makes the cube thinner when louder and fatter when no volume is hitting the channel,
        cubes[i].scale.z = ( 1 / 255 * (255 - (currentAudioChannelVolume/1.5)) ); // 1.5 at the end should restrict the scale at roughly 70% otherwise high volumes becomes lines


        cubes[i].material.color.setHSL(0.27 / 255 * (255 - currentAudioChannelVolume), 1, 0.6); // HSL color wheel, 0.27 (100 degrees) is green from silence to 0 (red)
        cubes[i].material.ambient.setHSL(0.27 / 255 * (255 - currentAudioChannelVolume), 1, 0.5);
        cubes[i].material.opacity = 1 / 255 * currentAudioChannelVolume;

        // Same stuff as above but for the wireframe cubes so they will have similar size.
        cubesWireframe[i].scale.y = (currentAudioChannelVolume + 0.1) / 3;
        cubesWireframe[i].scale.x = ( 1 / 255 * (255 - (currentAudioChannelVolume/1.5)) );
        cubesWireframe[i].scale.z = ( 1 / 255 * (255 - (currentAudioChannelVolume/1.5)) );

        cubesWireframe[i].position.y = ((currentAudioChannelVolume + 0.1) / 3) / 2;

        cubesWireframe[i].material.color.setHSL(0.27 / 255 * (255 - currentAudioChannelVolume), 1, 0.6);
        cubesWireframe[i].material.ambient.setHSL(0.27 / 255 * (255 - currentAudioChannelVolume), 1, 0.5);

      }
    };

    plane.material.ambient.setHSL(0, 0, data.mental/100); // HSL


    // controls.update(); // Uncomment this if you want to enable controls
    // renderer.render(scene, camera); // Uncomment this if you want to switch off postprocessing
  }
  else {
    for (var i = cubes.length - 1; i >= 0; i--) {
      cubes[i].scale.y = (Math.sin(time.getElapsedTime() + ((i*4)/cubes.length)) * 30) + 30.01; 
      cubes[i].position.y = ((Math.sin(time.getElapsedTime() + ((i*4)/cubes.length)) * 30) + 30.01) / 2; 

      cubesWireframe[i].scale.y = (Math.sin(time.getElapsedTime() + ((i*4)/cubes.length)) * 30) + 30.01; 
      cubesWireframe[i].position.y = ((Math.sin(time.getElapsedTime() + ((i*4)/cubes.length)) * 30) + 30.01) / 2; 

    }
  }  
  
  renderer.clear(); // Comment this if you want to switch off postprocessing
  composer.render(time.getElapsedTime()); // Comment this if you want to switch off postprocessing
  
  requestAnimationFrame(render);  
};

render(); // Ciao

function cameraRender() {

  if (data.mental > data.threshold && beat == false) {
    beat = true;
    data.camera++;
    if (data.camera > 2) {
      data.camera = 0;
    }
  } 
  if (data.mental < data.threshold) {
    beat = false;
  }



  switch (data.camera) {
    case 1:
      camera.position.x = cubes[centerCube].position.x; // X Cos wave around the center cube (I know, I should calculate the center of the group instead)
      camera.position.z = cubes[centerCube].position.z; // Z Sin wave around center cube, now my camera goes around. PS. 350 is the distance of the camera.
      camera.position.y = 265 + (120 * data.mental/100); // Make the camera bounce on rhythm
      
      camera.lookAt(cubes[centerCube].position); // Comment this if you want to enable controls, otherwise it crashes badly
      break;
    case 2:
      camera.position.x = ( (Math.cos(time.getElapsedTime() / 8)) * cubeDimension/1.5) + cubes[centerCube].position.x; // X Cos wave around the center cube (I know, I should calculate the center of the group instead)
      camera.position.z = ( (Math.sin(time.getElapsedTime() / 8)) * cubeDimension/1.5) + cubes[centerCube].position.z; // Z Sin wave around center cube, now my camera goes around. PS. 350 is the distance of the camera.
      camera.position.y = 0; // Make the camera bounce on rhythm

      camera.lookAt(cubes[centerCube].position); // Comment this if you want to enable controls, otherwise it crashes badly
      
      break;
    case 0:
    default:
      camera.position.x = ( (Math.cos(time.getElapsedTime() / 4)) * 350) + cubes[centerCube].position.x; // X Cos wave around the center cube (I know, I should calculate the center of the group instead)
      camera.position.z = ( (Math.sin(time.getElapsedTime() / 4)) * 350) + cubes[centerCube].position.z; // Z Sin wave around center cube, now my camera goes around. PS. 350 is the distance of the camera.
      camera.position.y = 65 + (120 * data.mental/100); // Make the camera bounce on rhythm
      
      camera.lookAt(cubes[centerCube].position); // Comment this if you want to enable controls, otherwise it crashes badly

      break;
  }
}


// Mouse and resize events
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  composer.reset(); // Comment this if you want to switch off postprocessing
}

// Not used, but I leave this on my templates if I want a slight camera panning
function onDocumentMouseMove( event ) {
  mouseX = event.clientX - window.innerWidth/2;
  mouseY = event.clientY - window.innerHeight/2;
}