/**
 * This script will only work on browsers with AudioContext and WebGL active, in short: get the latest Chrome.
 * IE11 at the time of writing does not support AudioContext, but it renders WebGL pretty good.
 * I know Safari (6) has WebGL issues and you might need to enable it on your settings/flags, also doesn't support AudioContext not sure of the latest.
 * Don't even think to run this on mobile Safari.
 * I haven't tested Firefox but unless you're running an ancient version I am pretty confident this works on FF too.
 * 
 * Built with Mrdoob's Threejs (http://threejs.org), keyboard and probably LSD.
 * Using Michael Bromley's code to grab music from Soundcloud and analyze it (https://github.com/michaelbromley/soundcloud-visualizer)
 *
 * Below the well commented dark magic.
 *
 *
 * Allowed to fork, play with this, post ut on your website, show to your mum as long you give credit to the original owners.
 *
 * Luigi Mannoni (http://luigimannoni.com)
 * Twitter: @mashermack 
 * More experiments on:
 * Codepen: http://codepen.io/luigimannoni
 * Github: https://github.com/luigimannoni/luigimannoni.github.io
 * Last update on 28/01/2015
 */


// Since I suck at trigonometry I'll just convert radii into degrees.
function deg2rad(_degrees) {
  return (_degrees * Math.PI / 180);
}

// Init values
var mouseX = 0, mouseY = 0, composer, controls;

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
var planeGeometry = new THREE.PlaneGeometry( 10000, 10000 );
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
	cubeRows = 10, 
	cubeColumns = 10, 
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
          opacity: 0.45 // It will change on runtime anyway.
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
var effectFilm = new THREE.FilmPass( 0.9, 0.9, 2048, false );

// Applying composer
effectFilm.renderToScreen = true;

composer = new THREE.EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectBloom );
composer.addPass( effectFilm );


var time = new THREE.Clock();

// Render function
var render = function () {  

  // I recycled the mental var, this should go from 0 to 1 and jumps in between with the music
  // It's not an ideal beat detector but it works!
  var mental = (Math.min(Math.max((Math.tan(audioSource.volumeHi/6500) * 0.5)), 2)); 


  camera.position.x = ( (Math.cos(time.getElapsedTime() / 4)) * 350) + cubes[45].position.x; // X Cos wave around cube #45 (I know, I should calculate the center of the group)
  camera.position.z = ( (Math.sin(time.getElapsedTime() / 4)) * 350) + cubes[45].position.z; // Z Sin wave around cube #45, now my camera goes around. PS. 350 is the distance of the camera.
  camera.position.y = 65 + (120 * mental); // Make the camera bounce on rhythm

  for (var i = audioSource.streamData.length - 1; i >= 0; i--) {
  	// My error here is: I am still doing a full cycle for the streamData array while I should pick only as many channel as my cube matrix
  	// I have left this just in case I wanted to increase the 
    if(!!cubes[i]) { // Need to save javascript into crashing
      
      var currentAudioChannelVolume = audioSource.streamData[i]; // Makes more sense than streamData

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

  plane.material.ambient.setHSL(0, 0, mental); // HSL

  
  // controls.update(); // Uncomment this if you want to enable controls
  // renderer.render(scene, camera); // Uncomment this if you want to switch off postprocessing
  
  
  camera.lookAt(cubes[45].position); // Comment this if you want to enable controls, otherwise it crashes badly
  
  renderer.clear(); // Comment this if you want to switch off postprocessing
  composer.render(time.getElapsedTime()); // Comment this if you want to switch off postprocessing
  
  requestAnimationFrame(render);  
};

render(); // Ciao


/**
 * Michael Bromley's Soundcloud Analyzer
 * https://github.com/michaelbromley/soundcloud-visualizer)
 */


var SoundCloudAudioSource = function(player) {
  var self = this;
  var analyser;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  var source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  var sampleAudioStream = function() {
    analyser.getByteFrequencyData(self.streamData);
    // Calculate an overall volume value
    var total = 0;
    for (var i = 0; i < 64; i++) { // Get the volume from the first 64 bins
      total += self.streamData[i];
    }
    self.volume = total;

    var totalLow = 0;
    for (var i = 0; i < 31; i++) { // Get the volume from the first 32 bins
      totalLow += self.streamData[i];
    }
    self.volumeLow = totalLow;

    var totalHi = 0;
    for (var i = 31; i < 64; i++) { // Get the volume from the second 32 bins
      totalHi += self.streamData[i];
    }
    self.volumeHi = totalHi;
  };

  setInterval(sampleAudioStream, 20);

  // Public properties and methods
  this.volume = 0;
  this.volumeLow = 0;
  this.volumeHi = 0;
  this.streamData = new Uint8Array(256);
  this.playStream = function(streamUrl) {
      // Get the input stream from the audio element
      player.addEventListener('ended', function(){
          self.directStream('coasting');
      });
      player.setAttribute('src', streamUrl);
      player.play();
  }
};
var Visualizer = function() {
  var audioSource;
    this.init = function(options) {
        audioSource = options.audioSource;
        var container = document.getElementById(options.containerId);        
    };
};

var SoundcloudLoader = function(player,uiUpdater) {
  var self = this;
  var client_id = "7ff7507da281c083017c7ffb499b1955"; // to get an ID go to http://developers.soundcloud.com/
  this.sound = {};
  this.streamUrl = "";
  this.errorMessage = "";
  this.player = player;

  /**
   * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
   * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
   * @param track_url
   * @param callback
   */
  this.loadStream = function(track_url, successCallback, errorCallback) {
      SC.initialize({
          client_id: client_id
      });
      SC.get('/resolve', { url: track_url }, function(sound) {
          if (sound.errors) {
              self.errorMessage = "";
              for (var i = 0; i < sound.errors.length; i++) {
                  self.errorMessage += sound.errors[i].error_message + '<br>';
              }
              self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
              errorCallback();
          } else {

              if(sound.kind=="playlist"){
                  self.sound = sound;
                  self.streamPlaylistIndex = 0;
                  self.streamUrl = function(){
                      return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
                  }
                  successCallback();
              }else{
                  self.sound = sound;
                  self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
                  successCallback();
              }
          }
      });
  };


  this.directStream = function(direction){
      if(direction=='toggle'){
          if (this.player.paused) {
              this.player.play();
          } else {
              this.player.pause();
          }
      }
      else if(this.sound.kind=="playlist"){
          if(direction=='coasting') {
              this.streamPlaylistIndex++;
          }else if(direction=='forward') {
              if(this.streamPlaylistIndex>=this.sound.track_count-1) this.streamPlaylistIndex = 0;
              else this.streamPlaylistIndex++;
          }else{
              if(this.streamPlaylistIndex<=0) this.streamPlaylistIndex = this.sound.track_count-1;
              else this.streamPlaylistIndex--;
          }
          if(this.streamPlaylistIndex>=0 && this.streamPlaylistIndex<=this.sound.track_count-1) {
             this.player.setAttribute('src',this.streamUrl());
             this.player.play();
          }
      }
  }


};


var visualizer = new Visualizer();
var player =  document.getElementById('player');
var loader = new SoundcloudLoader(player);

var audioSource = new SoundCloudAudioSource(player);
var form = document.getElementById('form');
var loadAndUpdate = function(trackUrl) {
  loader.loadStream(trackUrl,
      function() {
          audioSource.playStream(loader.streamUrl());
      }, function(){});
};

visualizer.init({
  containerId: 'visualizer',
  audioSource: audioSource
});


// On load, check to see if there is a track token in the URL, and if so, load that automatically
if (window.location.hash) {
  var trackUrl = 'https://soundcloud.com/' + window.location.hash.substr(1);
  loadAndUpdate(trackUrl);
}
else {
var trackUrl = 'https://soundcloud.com/' + 'sterlingmoss/chris-liberator-sterling-moss-live-set-april-2013';
  loadAndUpdate(trackUrl);      
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
