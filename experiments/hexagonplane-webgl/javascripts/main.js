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
    // calculate an overall volume value
    var total = 0;
    for (var i = 0; i < 64; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
        total += self.streamData[i];
    }
    self.volume = total;
    
    var totalLow = 0;
    for (var i = 0; i < 31; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
        totalLow += self.streamData[i];
    }
    self.volumeLow = totalLow;
    
    var totalHi = 0;
    for (var i = 31; i < 64; i++) { // get the volume from the first 80 bins, else it gets too loud with treble
        totalHi += self.streamData[i];
    }
    self.volumeHi = totalHi;


};
setInterval(sampleAudioStream, 20);
// public properties and methods
this.volume = 0;
this.volumeLow = 0;
this.volumeHi = 0;
this.volumePrev = 0;
this.streamData = new Uint8Array(256);
this.playStream = function(streamUrl) {
    // get the input stream from the audio element
    player.addEventListener('ended', function(){
        self.directStream('coasting');
    });
    player.setAttribute('src', streamUrl);
    player.play();
}
};
var Visualizer = function() {
var audioSource;
  var draw = function() {
      // Beat
      var mental = (Math.min(Math.max((Math.tan(audioSource.volumeHi/6500) * 0.5), -20), 2) * -1);
      /*
      $('.scope ul li').each(function(count){
        $(this).css('height', audioSource.streamData[count]);
      });
      if (audioSource.volumeHi - audioSource.volumePrev > 50 || audioSource.volumeHi - audioSource.volumePrev < -50 ) {
        $('.fullscreen').css('background', '#fff');
        $('.cube').addClass('trigger');
        $('.scope').addClass('trigger');
      } else {
        $('.fullscreen').css('background', '#222');
        $('.cube').removeClass('trigger');
        $('.scope').removeClass('trigger');
      }
      audioSource.volumePrev = audioSource.volumeHi;
      requestAnimFrame(draw);*/
  };

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
//this.uiUpdater = uiUpdater;

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


// on load, check to see if there is a track token in the URL, and if so, load that automatically
if (window.location.hash) {
  var trackUrl = 'https://soundcloud.com/' + window.location.hash.substr(1);
  loadAndUpdate(trackUrl);
}
else {
var trackUrl = 'https://soundcloud.com/' + 'sterlingmoss/chris-liberator-sterling-moss-live-set-april-2013';
  loadAndUpdate(trackUrl);      
}



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
var torusRadius = 15, torusTubeDiameter = 4, torusRows = 10, torusColumns = 10, torusVerticalPadding = 6, torusHorizontalPadding = 2, toruses = [];
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
camera.position.x = 0;
camera.position.y = 0;

group.position.x = -170;
group.position.y = -140;
group.position.z = -150;

group.rotation.x = -0.4;
group.rotation.y = 0;
group.rotation.z = 0;

var time = new THREE.Clock();
var rowCounter = 0;

var render = function () {  
  /*var startTorus = rowCounter * torusRows;
  var endTorus = (torusColumns - 1) + (rowCounter * torusRows);
  
  for (var i = startTorus; i <= endTorus; i++) {
    toruses[i].position.z = Math.sin(Date.now()) * 10;
  }
  
  
  rowCounter++;
  if (rowCounter >= torusRows) {
    rowCounter = 0;
  }
  */

  var mental = (Math.min(Math.max((Math.tan(audioSource.volumeHi/6500) * 0.5)-20), 2) * -1);
  for (var i = audioSource.streamData.length - 1; i >= 0; i--) {
    if(!!toruses[i]) {
      toruses[i].position.z = ((audioSource.streamData[i] * -1 )/ 10);
    }
  };
  console.log(audioSource.streamData);
  /*
  if (audioSource.volumeHi - audioSource.volumePrev > 50 || audioSource.volumeHi - audioSource.volumePrev < -50 ) {
    $('.fullscreen').css('background', '#fff');
    $('.cube').addClass('trigger');
    $('.scope').addClass('trigger');
  } else {
    $('.fullscreen').css('background', '#222');
    $('.cube').removeClass('trigger');
    $('.scope').removeClass('trigger');
  }
  audioSource.volumePrev = audioSource.volumeHi;*/

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





