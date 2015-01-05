  window.requestAnimFrame = function(){
    return (
      window.requestAnimationFrame       || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function(callback){
        window.setTimeout(callback, 1000 / 60);
      }
    );
  }();

  window.cancelAnimFrame = function(){
    return (
      window.cancelAnimationFrame       || 
      window.webkitCancelAnimationFrame || 
      window.mozCancelAnimationFrame    || 
      window.oCancelAnimationFrame      || 
      window.msCancelAnimationFrame     || 
      function(id){
        window.clearTimeout(id);
      }
    );
  }();

(function($) {
  'use strict';

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
      this.streamData = new Uint8Array(64);
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
          $('.scope ul li').each(function(count){
            $(this).css('height', audioSource.streamData[count]);
          });
          if (audioSource.volume - audioSource.volumePrev > 100 || audioSource.volume - audioSource.volumePrev < -100 ) {
            $('.fullscreen').css('background', '#fff');
            $('.cube').addClass('trigger');
          } else {
            $('.fullscreen').css('background', '#222');
            $('.cube').removeClass('trigger');
          }
          audioSource.volumePrev = audioSource.volume;
          requestAnimFrame(draw);
      };

      this.init = function(options) {
          audioSource = options.audioSource;
          var container = document.getElementById(options.containerId);
          console.log(audioSource);
         
          draw();
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
      var trackUrl = 'https://soundcloud.com/' + 'nineinchnails/gave-up';
        loadAndUpdate(trackUrl);      
    }

})(jQuery);