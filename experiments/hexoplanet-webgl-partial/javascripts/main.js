	var mouseX = 0, mouseY = 0, composer, controls;
	var postprocessing = { enabled : true };
	var screenSpacePosition = new THREE.Vector3();
	var bgColor = 0x000000;
	var sunColor = 0xffee00;

	var renderer = new THREE.WebGLRenderer({ antialias: true });
	//renderer.setClearColor( 0x000000, 0 ); // background
	//renderer.autoClear = false;

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

// Normal Scene
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 15000);
	camera.position.z = -350;

// Occlusion
	var oclscene = new THREE.Scene();
	oclscene.add( new THREE.AmbientLight( 0xffffff ) );
	oclcamera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 15000);
	oclcamera.position = camera.position;

// Point for the camera
	var cameraPointer = new THREE.Mesh( new THREE.PlaneBufferGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({transparent:true, opacity:0}) );
	scene.add(cameraPointer);

	var materialDepth = new THREE.MeshDepthMaterial();
	var materialScene = new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading } );

// Skybox
	var geometry = new THREE.BoxGeometry( 10000, 10000, 10000 ); 
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


// Trackball camera
	controls = new THREE.TrackballControls( camera );
	controls.target = skybox.position;
	controls.minDistance = 120;
	controls.maxDistance = 2500;

// Lights
	var light = new THREE.PointLight( 0xffffff, 1, 1800 );
	scene.add( light );
	oclscene.add( light );


// Sphere Wireframe Outer
	var hexagonTexture = THREE.ImageUtils.loadTexture( 'javascripts/hexagongrid.jpg' );
	hexagonTexture.wrapS = hexagonTexture.wrapT = THREE.RepeatWrapping;
	hexagonTexture.repeat.set( 4, 2 );


	var uniforms = {
	  time:   { type: "f", value: 1.0 },
	  scale:  { type: "f", value: 0.05 }
	};

// Sun
	var star = new THREE.Mesh(
	  new THREE.SphereGeometry( 56, 32, 32 ), 
	  new THREE.ShaderMaterial( {
	    uniforms: uniforms,
	    vertexShader: document.getElementById( 'vertexNoise' ).textContent,
	    fragmentShader: document.getElementById( 'fragmentNoise' ).textContent
	  })
	);

	scene.add(star);

// Volumetric light
	vlight = new THREE.Mesh(
	    new THREE.SphereGeometry( 56, 32, 32 ),
	    new THREE.MeshBasicMaterial({ color: 0xffffff })
	);
	oclscene.add( vlight );



	/* Glow shader
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
	    transparent: true,
	    alphaTest: 0.2,
	  })
	);

	scene.add(glow);*/

	// Planets and orbits
	var planets = {
	  objects: [],
	  sizes: [16, 20, 22, 21, 90, 40],
	  distances: [200, 400, 600, 800, 1300, 1900],
	  speeds: [2, 3, 5, 10, 15]
	}

	for (var i = planets.sizes.length - 1; i >= 0; i--) {
	  var planet = new THREE.Mesh(
	    new THREE.SphereGeometry( planets.sizes[i], 32, 32 ), 
	    new THREE.MeshPhongMaterial( {
	      color: 0xffffff,
	    })
	  );
	  planet.position.x = planets.distances[i];
	  planet.position.z = planets.distances[i];
	  planets.objects.push(planet);
	  scene.add(planet);

	  // Orbit
	  var orbit = new THREE.Line( new THREE.CircleGeometry( planets.distances[i], 64 ), new THREE.LineBasicMaterial( { color: 0xffffff } ) );

	  orbit.geometry.vertices.shift();
	  orbit.rotation.x = deg2rad(90);
	  
	  scene.add(orbit);
	};


	var time = new THREE.Clock();

	var sceneRenderPass = new THREE.RenderPass( scene, camera );
	var occlusionRenderPass = new THREE.RenderPass( oclscene, oclcamera );

	var composer = new THREE.EffectComposer(renderer); 
	

	//strength, kernelSize, sigma, resolution
	var bloomPass = new THREE.BloomPass( 4, 30, 8, 128 );
	
	var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
	effectCopy.renderToScreen = true;
	
	var additiveBlend = new THREE.ShaderPass(THREE.Extras.Shaders.Additive);
	additiveBlend.renderToScreen = true;	

	composer.addPass(sceneRenderPass);
	composer.addPass(bloomPass);
	//composer.addPass(additiveBlend);
	composer.addPass(effectCopy);

	//composer.addPass(occlusionRenderPass);
	//composer.addPass(effectCopy);

	var render = function () {
	  
	  uniforms.time.value += 0.02;  
	  controls.update();
	  for (var i = planets.objects.length - 1; i >= 0; i--) {
	    planets.objects[i].position.x = Math.cos(time.getElapsedTime() / planets.speeds[i]) * planets.distances[i];
	    planets.objects[i].position.z = Math.sin(time.getElapsedTime() / planets.speeds[i]) * planets.distances[i];
	  };
	  //planet.rotation.y += 0.002;
	  //particlesOuter.rotation.y += 0.001;
	  //smallerGlobes.rotation.y += 0.0005;
	  
	  //renderer.clear();
	  //renderer.render(scene, camera);
	  composer.render(time.getElapsedTime());

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

	  renderer.reset();
	}

	function onDocumentMouseMove( event ) {
	  mouseX = event.clientX - window.innerWidth/2;
	  mouseY = event.clientY - window.innerHeight/2;
	}


	// Since I suck at trigonometry I'll just convert degrees into radii.
	function deg2rad(_degrees) {
	  return (_degrees * Math.PI / 180);
	}