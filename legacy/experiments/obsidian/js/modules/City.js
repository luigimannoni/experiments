var City = function () {

	FRAME.Module.call( this );

	this.parameters.input = {

		cameraStartPosition: [100, 100, 100],
		cameraEndPosition: [-100, 100, 100],
		torusStartScale: [0, 0, 0],
		torusEndScale: [10, 10, 10]
	};

	var camera, light1, light2, scene;

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
			/*
		var prevMesh = false;
		var xgrid = 24,
			zgrid = 24;
		for ( i = 0; i < xgrid; i ++ )
		for ( j = 0; j < zgrid; j ++ ) {

			var x = Math.floor(Math.random() * (20 - 10)) + 10;
			var y = Math.floor(Math.random() * (50 - 20)) + 20;
			var z = Math.floor(Math.random() * (20 - 10)) + 10;

			var mesh = new THREE.Mesh( 
				new THREE.BoxGeometry( x, y, z ), 
				new THREE.MeshBasicMaterial({ color: 0x6666ff, wireframe: true })
			);

			x = 22 * ( i - xgrid/2 );
			//y = 22 * ( j - ygrid/2 );
			z = 22 * ( j - zgrid/2 );

			mesh.position.set( x, 0, z );
			scene.add( mesh );
			if (!prevMesh) {
				prevMesh = mesh;
			}
			else {
				mesh.updateMatrix();
				//prevMesh.merge( mesh.geometry, mesh.matrix );

				prevMesh = mesh;
			}
		
		}*/
		
		var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 10 );
		scene.add( hemisphereLight );

		light1 = new THREE.PointLight ( 0x4488cc, 6, 100 );
		light1.position.y = 55;
		light1.position.z = 135;
		light1.position.x = 135;

		light2 = new THREE.PointLight ( 0xcc4488, 6, 100 );
		light2.position.y = 55;
		light2.position.z = -135;
		light2.position.x = -135;
	}
	
	this.start = function ( t, parameters ) {
	  	//renderer.setClearColor( 0x000000, 0 ); // background
		cameraStartPosition.fromArray( parameters.cameraStartPosition );
		cameraEndPosition.fromArray( parameters.cameraEndPosition );
		cameraDeltaPosition.subVectors( cameraEndPosition, cameraStartPosition );	  
	};

	this.update = function ( t ) {

		camera.position.copy( cameraDeltaPosition );
		camera.position.multiplyScalar( t );
		camera.position.add( cameraStartPosition );
		camera.lookAt( scene.position );
		
		light1.position.x = Math.cos(t/5) * 300;
		light1.position.z = Math.sin(t/2) * 300;
		
		light2.position.x = Math.cos(t/2) * 200;
		light2.position.z = Math.sin(t/5) * 200;

		renderer.render( scene, camera );

	};

};
