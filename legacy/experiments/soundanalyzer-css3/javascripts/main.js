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
  streamUrl = 'javascripts/ghosts24.ogg';

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
              draw();
              document.getElementById('loading').style.display = 'none';
          },
          
          function(buffer) {
            document.getElementById('warning').style.display = 'block';          
          }
      );
  }

request.send();    
var bg = document.getElementsByClassName('fullscreen');
var scope = document.getElementsByClassName('scope-single');

function draw() {
    var volumeAvg = 0;
    analyser.getByteFrequencyData(dataArray);
    // Beat
    for (var i = 0; i < 128; i++) { // Get the volume from the first 128 bins
      volumeAvg += dataArray[i];
    }
    var mental = (Math.min(Math.max((Math.tan( (volumeAvg/(255*128) * 1.8) ) * 0.5)), 2)) * 100; 
    console.log(mental/100);
    for (var i = 0; i < scope.length; i++) {
      scope[i].style.height = dataArray[i] + 'px';  
    }
    bg[0].style.background = 'rgba(255, 255, 255, '+ (mental/100) +')';
    
    if (mental > 40 ) {
      $('.cube').addClass('trigger');
      $('.scope').addClass('trigger');
    } else {
      $('.cube').removeClass('trigger');
      $('.scope').removeClass('trigger');
    }
    requestAnimFrame(draw);
};

})(jQuery);