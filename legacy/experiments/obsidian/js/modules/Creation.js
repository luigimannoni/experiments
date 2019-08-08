var Creation = function () {

	FRAME.Module.call( this );

	this.parameters.input = {

		cameraStartPosition: [100, 100, 100],
		cameraEndPosition: [-100, 100, 100],
		seedStartPosition: [100, 100, 100],
		seedEndPosition: [-100, 100, 100]

	};

	var width = renderer.domElement.width;
	var height = renderer.domElement.height;

	var camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1500 );

	var scene = new THREE.Scene();

	var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
	var material = new THREE.MeshBasicMaterial( { 
		color: 0xffffff,
	} );
	var torus = new THREE.Mesh( geometry, material );
	torus.rotation.x = deg2rad(-90);
	torus.position.y = 150;
	torus.scale.x = 0.00001;
	torus.scale.y = 0.00001;

	scene.add( torus );

	/*var geometry = new THREE.BoxGeometry( 500, 500, 500 );	
	var materialArray = [];
	var directions  = ['front', 'back', 'top', 'bottom', 'right', 'left'];
	for (var i = 0; i < 6; i++) {
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( 'files/skybox_' + directions[i] + '.png' ),
			side: THREE.BackSide
		}));
	}
	var material = new THREE.MeshFaceMaterial( materialArray );
	var skybox = new THREE.Mesh( geometry, material );
	scene.add( skybox );*/

	var seed = new THREE.Object3D();
	scene.add( seed );

	var light1 = new THREE.PointLight( 0x8844ff, 5, 100 );
	light1.position.y = 15;
	seed.add( light1 );

	var light2 = new THREE.PointLight( 0xc84444, 5, 100 );
	light2.position.y = -15;
	seed.add( light2 );

	var geometry = new THREE.DodecahedronGeometry( 4, 2 );
	var material = new THREE.MeshLambertMaterial( {
		shading: THREE.FlatShading,
		ambient: 0x8844ff
	} );

	var core = new THREE.Mesh( geometry, material );
	core.position.y = 0;
	seed.add( core );
		
	// Planet surface 
	var geometry = new THREE.PlaneBufferGeometry( 1024, 1024, 256, 256 );
	var material = new THREE.MeshLambertMaterial( {

	} );

	var plane = new THREE.Mesh( geometry, material );
	plane.rotation.x = deg2rad(-90);
	scene.add( plane );
	
	var cameraStartPosition = new THREE.Vector3();
	var cameraEndPosition = new THREE.Vector3();
	var cameraDeltaPosition = new THREE.Vector3();

	var seedStartPosition = new THREE.Vector3();
	var seedEndPosition = new THREE.Vector3();
	var seedDeltaPosition = new THREE.Vector3();	
	
	this.start = function ( t, parameters ) {
	  	renderer.setClearColor( 0x000000, 0 ); // background
		cameraStartPosition.fromArray( parameters.cameraStartPosition );
		cameraEndPosition.fromArray( parameters.cameraEndPosition );
		cameraDeltaPosition.subVectors( cameraEndPosition, cameraStartPosition );	  

		seedStartPosition.fromArray( parameters.seedStartPosition );
		seedEndPosition.fromArray( parameters.seedEndPosition );
		seedDeltaPosition.subVectors( seedEndPosition, seedStartPosition );	  
	  
	};

	this.update = function ( t ) {

		camera.position.copy( cameraDeltaPosition );
		camera.position.multiplyScalar( t );
		camera.position.add( cameraStartPosition );
		camera.lookAt( seed.position );
		
		seed.position.copy( seedDeltaPosition );
		seed.position.multiplyScalar( t );
		seed.position.add( seedStartPosition );
		
		renderer.render( scene, camera );

	};

};
