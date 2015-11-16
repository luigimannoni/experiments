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
 * Allowed to fork, play with this, post it on your website, show to your mum as long you give credit to the original owners.
 *
 * Luigi Mannoni (http://luigimannoni.com)
 * Twitter: @mashermack 
 * More experiments on:
 * Codepen: http://codepen.io/luigimannoni
 * Github: https://github.com/luigimannoni/luigimannoni.github.io
 * Last update on 18/06/2015 - Fixed CrossOrigin bug
 * Last update on 29/07/2015 - Added warning
 */

/**
 * Michael Bromley's Soundcloud Analyzer
 * https://github.com/michaelbromley/soundcloud-visualizer)
 */

var audioCtxCheck = window.AudioContext || window.webkitAudioContext;
if (!audioCtxCheck) {
  document.getElementById('warning').style.display = 'block';
  document.getElementById('player').style.display = 'none';
}
else {

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
      requestAnimationFrame(sampleAudioStream);
    };

    requestAnimationFrame(sampleAudioStream);


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
        player.crossOrigin = 'anonymous';
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
    var client_id = "26095b994cc185bc665f4c9fcce8f211"; // to get an ID go to http://developers.soundcloud.com/
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


  var trackUrl = 'https://soundcloud.com/mhd-underground/mehdispoz-space-travel-unrelease';
  loadAndUpdate(trackUrl);      
  
} 

// Since I suck at trigonometry I'll just convert radii into degrees.
function deg2rad(_degrees) {
  return (_degrees * Math.PI / 180);
}
/**
 * BeatSampler.js
 */

var BeatSampler = function(_audioSource, _player, _config) {
  // AudioSource created from the context?
  if ( typeof(_config) == 'null' || typeof(_config) == 'undefined' ) {
    _config = {};
  }
  var audioSource = _audioSource,
      player = _player;
  
  var defaults = {
    channels:   256,
    decay:      3.00,    
    threshold:  0.90,    
  };
  
  var config = Object.create(defaults);
  Object.keys(_config).map(function (prop) {
    prop in config && (config[prop] = _config[prop]);
  });  

  
  this.getCurrentMental = function() {
    return (Math.min(Math.max((Math.tan(audioSource.volumeHi/6500) * 0.5)), 2)); 
  }

}
/**
 * WebGL Logic
 */


var controls;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
var innerColor = 0xff0000,
    outerColor = 0xff9900;
var innerSize = 32,
    outerSize = 64;    

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor( 0x000000, 0 ); // background

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.TrackballControls( camera );
controls.noPan = true;
controls.minDistance = 120;
controls.maxDistance = 650;
//
var imageLoader = new THREE.TextureLoader();

// Mesh
  var group = new THREE.Group();
  scene.add(group);

// Lights
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set( 0, 128, 128 );
  scene.add( directionalLight );

// Skybox
  var geometry = new THREE.BoxGeometry( 5000, 5000, 5000 ); 
  var materialArray = [];
  var directions  = ['right1', 'left2', 'top3', 'bottom4', 'front5', 'back6'];
  for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: imageLoader.load( 'javascripts/bluenebula1024_' + directions[i] + '.png' ),
      side: THREE.BackSide
    }));
  }
  var material = new THREE.MeshFaceMaterial( materialArray );
  var skybox = new THREE.Mesh( geometry, material );
  scene.add( skybox );

// Sun
  var uniforms = {
    time:   { type: "f", value: 1.0 },
    scale:  { type: "f", value: 0.05 }
  };
  var star = new THREE.Mesh(
    new THREE.SphereGeometry( innerSize, 32, 32 ), 
    new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexNoise' ).textContent,
      fragmentShader: document.getElementById( 'fragmentNoise' ).textContent
    })
  );

  scene.add(star);

  var glow = new THREE.Mesh(
    new THREE.SphereGeometry( innerSize+2, 32, 32 ), 
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
      transparent: true,
      alphaTest: 0.2,
    })
  );

  scene.add(glow);

var sphereOuter = new THREE.Group();
var icosahedronGeometry = new THREE.IcosahedronGeometry( outerSize, 3 );

var traMat = new THREE.MeshPhongMaterial( { color: innerColor, shading: THREE.FlatShading, side: THREE.DoubleSide, transparent: true, opacity: 0.8 } ),
    traMat2 = new THREE.MeshPhongMaterial( { color: innerColor, shading: THREE.FlatShading, side: THREE.DoubleSide, transparent: true, opacity: 1 } ),
    traMat3 = new THREE.MeshPhongMaterial( { color: innerColor, shading: THREE.FlatShading, side: THREE.DoubleSide, transparent: true, opacity: 0.1 } ),
    sunMat = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexNoise' ).textContent,
      fragmentShader: document.getElementById( 'fragmentNoise' ).textContent
    });

// materials
materials = [
    traMat,
    traMat2,
    traMat3,
    traMat,
    traMat2,
    traMat3,
];

var matCopy = [
    traMat,
    traMat2,
    traMat3,
    traMat,
    traMat2,
    traMat3,
];


// assign material to each face
for( var i = 0; i < icosahedronGeometry.faces.length; i++ ) {
    icosahedronGeometry.faces[ i ].materialIndex = THREE.Math.randInt(0, 5);
}

icosahedronGeometry.sortFacesByMaterialIndex(); // optional, to reduce draw calls




// Sphere Wireframe Outer
var icosahedronOuter = new THREE.Mesh(
  icosahedronGeometry,
  new THREE.MeshFaceMaterial(materials)
);
/*var icosahedronOuter = new THREE.Mesh(
  icosahedronGeometry,
  new THREE.MeshLambertMaterial({ 
    color: outerColor,
    ambient: outerColor,
    wireframe: false,
    transparent: true,
    shading: THREE.FlatShading,
    opacity: 1,
    //alphaMap: imageLoader.load( 'javascripts/alphamap.jpg' ),
    shininess: 0 
  })
);*/
sphereOuter.add(icosahedronOuter);

// The icosahedron helper
var icoEdgeHelper = new THREE.EdgesHelper( icosahedronOuter, innerColor );
icoEdgeHelper.material.linewidth = 0.5;
icoEdgeHelper.material.opacity = 0.2;
icoEdgeHelper.material.transparent = true;
scene.add( icoEdgeHelper ); // Needs to stay outside

// Clone geometry
var icoGeometryBuffer = new THREE.BufferGeometry();
icoGeometryBuffer.fromGeometry(icosahedronOuter.geometry);

// Particles Inner
var particlesInner = new THREE.Points(icoGeometryBuffer, new THREE.PointsMaterial({
  size: 2,
  color: innerColor,
  map: imageLoader.load( 'javascripts/particletexture.png' ),
  transparent: true,
  })
);
sphereOuter.add(particlesInner);
scene.add(sphereOuter);

// Starfield
var geometry = new THREE.Geometry();
for (i = 0; i < 5000; i++) {
  var vertex = new THREE.Vector3();
  vertex.x = Math.random()*2000-1000;
  vertex.y = Math.random()*2000-1000;
  vertex.z = Math.random()*2000-1000;
  geometry.vertices.push(vertex);
}
var starField = new THREE.Points(geometry, new THREE.PointsMaterial({
  size: 10,
  color: 0xffffff,
  map: imageLoader.load( 'javascripts/particletextureshaded.png' ),
  transparent: true
  })
);
scene.add(starField);


camera.position.z = -110;

var time = new THREE.Clock();
var mybeatsampler = new BeatSampler(audioSource);


var bS, rS, glS, tS;
  bS = new BrowserStats();
  glS = new glStats();
  tS = new threeStats( renderer );
  rS = new rStats( {
    CSSPath: '../../libs/rstats/',
    values: {
        frame: { caption: 'Total frame time (ms)', over: 16, average: true, avgMs: 100 },
        fps: { caption: 'Framerate (FPS)', below: 30 },
        calls: { caption: 'Calls (three.js)', over: 3000 },
        raf: { caption: 'Time since last rAF (ms)', average: true, avgMs: 100 },
        rstats: { caption: 'rStats update (ms)', average: true, avgMs: 100 },
        texture: { caption: 'GenTex', average: true, avgMs: 100 }
    },
    groups: [
        { caption: 'Framerate', values: [ 'fps', 'raf' ] },
        { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
    ],
    fractions: [
        { base: 'frame', steps: [ 'texture', 'setup', 'render' ] }
    ],
    plugins: [
        bS,
        tS,
        glS
    ]
  } );


var render = function () {

rS( 'frame' ).start();
    glS.start();
    
    rS( 'rAF' ).tick();
    rS( 'FPS' ).frame();
    rS( 'setup' ).start();
    rS( 'setup' ).end();
  
    rS( 'render' ).start();
    renderer.render(scene, camera);

  if (audioCtxCheck && player.paused == false) {
    // Audio Context is supported
    var mental = mybeatsampler.getCurrentMental();
    
    uniforms.time.value += 0.02;  
    
    sphereOuter.rotation.x += 0.001;
    sphereOuter.rotation.z += 0.001;
    
    starField.rotation.y -= 0.002;

    var innerShift = Math.abs(Math.cos(( (time.getElapsedTime()+2.5) / 20))) / 10;
    var outerShift = Math.abs(Math.cos(( (time.getElapsedTime()+5) / 10)));
    
    rS( 'innerShift' ).set(innerShift);
    rS( 'outerShift' ).set(outerShift);

    for (var i = 0; i < materials.length; i++) {
        materials[i].color.setHSL(innerShift, 1, 0.5);
        materials[i].opacity = Math.abs(Math.cos(time.getElapsedTime()/i+1)*1);  
    }

    icoEdgeHelper.material.color.setHSL(innerShift, 1, 0.5);
    particlesInner.material.color.setHSL(innerShift, 1, 0.5);

    //starField.material.opacity = 

    directionalLight.position.x = Math.cos(time.getElapsedTime()/0.5)*128;
    directionalLight.position.y = Math.cos(time.getElapsedTime()/0.5)*128;
    directionalLight.position.z = Math.sin(time.getElapsedTime()/0.5)*128;

    /*    rS( 'shuffling' ).start();    
    if (parseInt(time.getElapsedTime())%10 == 0) {
      for( var i = 0; i < icosahedronOuter.material.materials.length; i++ ) {
        var applyThis = THREE.Math.randInt(0, 5); 
        icosahedronOuter.material.materials[i] = matCopy[applyThis];
      }
    }
    rS( 'shuffling' ).end();
    */
    
  }
  else {
    // Fallback for no support for AudioContext
  }  


  rS( 'render' ).end();
  rS( 'frame' ).end();

  controls.update();
  
  rS( 'rStats' ).start();
  rS().update();
  rS( 'rStats' ).end();
  
  requestAnimationFrame(render);  
};

console.log(icosahedronGeometry.faces[0]);

render(); // Ciao


// Mouse and resize events
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}