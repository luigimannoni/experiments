var mouseX = 0, mouseY = 0, composer, controls;
var postprocessing = { enabled : true };
var screenSpacePosition = new THREE.Vector3();
var sunPosition = new THREE.Vector3( 0, 120, 1000 );
var bgColor = 0x000000;
var sunColor = 0x00ffee;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setClearColor( 0x000000, 0 ); // background
//renderer.autoClear = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new THREE.TrackballControls( camera );
controls.target = scene.position;
controls.minDistance = 120;
controls.maxDistance = 200;

var materialDepth = new THREE.MeshDepthMaterial();
var materialScene = new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading } );

var geometry = new THREE.BoxGeometry( 5000, 5000, 5000 ); 
var materialArray = [];
var directions  = ['right1', 'left2', 'top3', 'bottom4', 'front5', 'back6'];
for (var i = 0; i < 6; i++) {
  materialArray.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( 'javascripts/bluenebula1024_' + directions[i] + '.png' ),
    side: THREE.BackSide
  }));
}
var material = new THREE.MeshFaceMaterial( materialArray );
var skybox = new THREE.Mesh( geometry, material );
scene.add( skybox );


// Lights
var light = new THREE.HemisphereLight( 0x666666 ); // soft white light
scene.add( light );

var whiteLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
whiteLight.position.set( 0, 128, 128 );
scene.add( whiteLight );

var redLight = new THREE.DirectionalLight( 0xff0000, 0.2 );
redLight.position.set( 0, 128, 128 );
scene.add( redLight );

camera.position.z = -150;

// Sphere Wireframe Outer
var hexagonTexture = THREE.ImageUtils.loadTexture( 'javascripts/hexagongrid.jpg' );
hexagonTexture.wrapS = hexagonTexture.wrapT = THREE.RepeatWrapping;
hexagonTexture.repeat.set( 4, 2 );


var uniforms = {
  time:   { type: "f", value: 1.0 },
  scale:  { type: "f", value: 0.05 }
};

var planet = new THREE.Mesh(
  new THREE.SphereGeometry( 56, 32, 32 ), 
  new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexNoise' ).textContent,
    fragmentShader: document.getElementById( 'fragmentNoise' ).textContent
  })
);

scene.add(planet);



// Glow shader
var glow = new THREE.Mesh(
  new THREE.SphereGeometry( 60, 32, 32 ), 
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
    transparent: true
  })
);

scene.add(glow);

// Fake sun shader
var fakeSun = new THREE.Mesh(
  new THREE.SphereGeometry( 32, 32, 32 ), 
  new THREE.ShaderMaterial( {
    uniforms: { 
      "c":   { type: "f", value: 1 },
      "p":   { type: "f", value: 6 },
      glowColor: { type: "c", value: new THREE.Color(0xffffbb) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: document.getElementById( 'vertexGlow' ).textContent,
    fragmentShader: document.getElementById( 'fragmentGlow' ).textContent,
    //blending: THREE.AdditiveBlending,
    //transparent: true
  })
);
fakeSun.position.y = 500;
fakeSun.position.z = 500;

scene.add(fakeSun);

// Particles
var geometry = new THREE.Geometry();
for (i = 0; i < 128000; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 56.5,
         y * 56.5,
         z * 56.5
  );
   
  geometry.vertices.push(vertex);

}


var particlesOuter = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
  size: 0.5,
  color: 0xFF2C2C,
  sizeAttenuation: true,
  transparent: true,
  alphaTest: 0.2,
  })
);
//scene.add(particlesOuter);

// The smaller globes around...
var smallerGlobesGeometry = new THREE.Geometry();
for (i = 0; i < 5; i++) {
  
  var x = -1 + Math.random() * 2;
  var y = -1 + Math.random() * 2;
  var z = -1 + Math.random() * 2;
  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  x *= d;
  y *= d;
  z *= d;
   
  var vertex = new THREE.Vector3(
         x * 70,
         y * 70,
         z * 70
  );
   
  smallerGlobesGeometry.vertices.push(vertex);

}
var smallerGlobes = new THREE.PointCloud(smallerGlobesGeometry, new THREE.PointCloudMaterial({
  size: 24,
  color: 0xffffff,
  map: THREE.ImageUtils.loadTexture( 'javascripts/particletextureshaded.png' ),
  sizeAttenuation: true,
  alphaTest: 0.2,
  transparent: true,
  })
);
scene.add(smallerGlobes);

initPostprocessing();

var renderModel = new THREE.RenderPass( scene, camera );
var effectGlitch = new THREE.GlitchPass( );

effectGlitch.renderToScreen = true;

composer = new THREE.EffectComposer( renderer );

composer.addPass( renderModel );
composer.addPass( effectGlitch );

var time = new THREE.Clock();

var render = function () {
  
  uniforms.time.value += 0.02;  
  
  planet.rotation.y += 0.002;
  particlesOuter.rotation.y += 0.001;
  smallerGlobes.rotation.y += 0.0005;
  
  if ( postprocessing.enabled ) {

    // Find the screenspace position of the sun

    screenSpacePosition.copy( sunPosition ).project( camera );

    screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
    screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;

    // Give it to the god-ray and sun shaders

    postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
    postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

    postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
    postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

    // -- Draw sky and sun --

    // Clear colors and depths, will clear to sky color

    renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );

    // Sun render. Runs a shader that gives a brightness based on the screen
    // space distance to the sun. Not very efficient, so i make a scissor
    // rectangle around the suns position to avoid rendering surrounding pixels.

    var sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
    var sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

    screenSpacePosition.x *= window.innerWidth;
    screenSpacePosition.y *= window.innerHeight;

    renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
    renderer.enableScissorTest( true );

    postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / window.innerHeight;

    postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
    renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors );

    renderer.enableScissorTest( false );

    // -- Draw scene objects --

    // Colors

    scene.overrideMaterial = null;
    renderer.render( scene, camera, postprocessing.rtTextureColors );

    // Depth

    scene.overrideMaterial = materialDepth;
    renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

    // -- Render god-rays --

    // Maximum length of god-rays (in texture space [0,1]X[0,1])

    var filterLen = 1.0;

    // Samples taken by filter

    var TAPS_PER_PASS = 6.0;

    // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
    // would start with a small filter support and grow to large. however
    // the large-to-small order produces less objectionable aliasing artifacts that
    // appear as a glimmer along the length of the beams

    // pass 1 - render into first ping-pong target

    var pass = 1.0;
    var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

    postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
    postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureDepth;

    postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

    renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2 );

    // pass 2 - render into second ping-pong target

    pass = 2.0;
    stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

    postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
    postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays2;

    renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1  );

    // pass 3 - 1st RT

    pass = 3.0;
    stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

    postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
    postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays1;

    renderer.render( postprocessing.scene, postprocessing.camera , postprocessing.rtTextureGodRays2  );

    // final pass - composite god-rays onto colors

    postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
    postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;

    postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

    renderer.render( postprocessing.scene, postprocessing.camera );
    postprocessing.scene.overrideMaterial = null;

  } else {

    renderer.clear();
    composer.render(time.getElapsedTime());
    //renderer.render(scene, camera);  
  }

  controls.update();

  
  requestAnimationFrame(render);  
  
};

render();

function initPostprocessing() {

  postprocessing.scene = new THREE.Scene();

  postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
  postprocessing.camera.position.z = 0;

  postprocessing.scene.add( postprocessing.camera );

  var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
  postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

  // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
  // investigate further for now.
  // pars.format = THREE.LuminanceFormat;

  // I would have this quarter size and use it as one of the ping-pong render
  // targets but the aliasing causes some temporal flickering

  postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

  // Aggressive downsize god-ray ping-pong render targets to minimize cost

  var w = window.innerWidth / 4.0;
  var h = window.innerHeight / 4.0;
  postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
  postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

  // god-ray shaders

  var godraysGenShader = THREE.ShaderGodRays[ "godrays_generate" ];
  postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
  postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

    uniforms: postprocessing.godrayGenUniforms,
    vertexShader: godraysGenShader.vertexShader,
    fragmentShader: godraysGenShader.fragmentShader

  } );

  var godraysCombineShader = THREE.ShaderGodRays[ "godrays_combine" ];
  postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
  postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

    uniforms: postprocessing.godrayCombineUniforms,
    vertexShader: godraysCombineShader.vertexShader,
    fragmentShader: godraysCombineShader.fragmentShader

  } );

  var godraysFakeSunShader = THREE.ShaderGodRays[ "godrays_fake_sun" ];
  postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
  postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

    uniforms: postprocessing.godraysFakeSunUniforms,
    vertexShader: godraysFakeSunShader.vertexShader,
    fragmentShader: godraysFakeSunShader.fragmentShader

  } );

  postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
  postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

  postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.5;

  postprocessing.quad = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ),
    postprocessing.materialGodraysGenerate
  );
  postprocessing.quad.position.z = -100;
  postprocessing.scene.add( postprocessing.quad );

}

// Mouse and resize events
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  composer.reset();
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX - window.innerWidth/2;
  mouseY = event.clientY - window.innerHeight/2;
}