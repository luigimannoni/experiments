var Torus2 = function () {

	FRAME.Module.call( this );

	this.parameters.input = {

		cameraStartPosition: [100, 100, 100],
		cameraEndPosition: [-100, 100, 100],
		torusStartScale: [0, 0, 0],
		torusEndScale: [10, 10, 10]
	};

	var camera, torus, scene, light;

	var cameraStartPosition = new THREE.Vector3();
	var cameraEndPosition = new THREE.Vector3();
	var cameraDeltaPosition = new THREE.Vector3();

	var torusStartScale = new THREE.Vector3();
	var torusEndScale = new THREE.Vector3();
	var torusDeltaScale = new THREE.Vector3();	
	
	this.init = function ( parameters ) {

		var width = renderer.domElement.width;
		var height = renderer.domElement.height;

		camera = new THREE.PerspectiveCamera( 60, width / height, 1, 10000 );

		scene = new THREE.Scene();
		
		var geometry = new THREE.BoxGeometry( 5000, 5000, 5000 );	
		var materialArray = [];
		var directions  = ['right1', 'left2', 'top3', 'bottom4', 'front5', 'back6'];
		for (var i = 0; i < 6; i++) {
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture( 'files/bluenebula1024_' + directions[i] + '.png' ),
				side: THREE.BackSide
			}));
		}
		var material = new THREE.MeshFaceMaterial( materialArray );
		var skybox = new THREE.Mesh( geometry, material );
		scene.add( skybox );

		var normalTexture = THREE.ImageUtils.loadTexture( 'files/spaceship_normal.jpg' );
		normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
		normalTexture.repeat.set( 6, 2 );

		var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
		var material = new THREE.MeshPhongMaterial( { 
			//shading: THREE.FlatShading,
			color: 0x333333,
			normalMap: normalTexture,
			shininess: 35
		} );
		torus = new THREE.Mesh( geometry, material );
		torus.rotation.x = deg2rad(-90);
		torus.position.y = 150;
		torus.scale.x = 0.00001;
		torus.scale.y = 0.00001;

		scene.add( torus );
		
		var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 10 );
		scene.add( hemisphereLight );
	}
	this.start = function ( t, parameters ) {
	  	//renderer.setClearColor( 0x000000, 0 ); // background
		cameraStartPosition.fromArray( parameters.cameraStartPosition );
		cameraEndPosition.fromArray( parameters.cameraEndPosition );
		cameraDeltaPosition.subVectors( cameraEndPosition, cameraStartPosition );	  

		torusStartScale.fromArray( parameters.torusStartScale );
		torusEndScale.fromArray( parameters.torusEndScale );
		torusDeltaScale.subVectors( torusEndScale, torusStartScale );
	};

	this.update = function ( t ) {

		camera.position.copy( cameraDeltaPosition );
		camera.position.multiplyScalar( t );
		camera.position.add( cameraStartPosition );
		camera.lookAt( torus.position );
		
		torus.scale.copy( torusDeltaScale );
		torus.scale.multiplyScalar( t );
		torus.scale.add( torusStartScale );
		
		renderer.render( scene, camera );

	};

};
