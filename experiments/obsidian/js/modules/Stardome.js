var Stardome = function () {

	FRAME.Module.call( this );

	this.parameters.input = {

		cameraStartPosition: [100, 100, 100],
		cameraEndPosition: [-100, 100, 100],

	};

	var width = renderer.domElement.width;
	var height = renderer.domElement.height;

	var camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );

	var scene = new THREE.Scene();
	
	var stardomeGeometry = new THREE.Geometry();
	for (i = 0; i < 15000; i++) {
	  
	  var x = -1 + Math.random() * 2;
	  var y = -1 + Math.random() * 2;
	  var z = -1 + Math.random() * 2;
	  var d = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
	  x *= d;
	  y *= d;
	  z *= d;
	   
	  var vertex = new THREE.Vector3(
	         x * 500,
	         y * 500,
	         z * 500
	  );
	   
	  stardomeGeometry.vertices.push(vertex);
	}
	var stardome = new THREE.PointCloud(stardomeGeometry, new THREE.PointCloudMaterial({
	  size: 0.1,
	  color: 0xffffff,
	  transparent: true,
	  alphaTest: false
	  })
	);
	scene.add(stardome);

	
	var cameraStartPosition = new THREE.Vector3();
	var cameraEndPosition = new THREE.Vector3();
	var cameraDeltaPosition = new THREE.Vector3();

	this.start = function ( t, parameters ) {
		cameraStartPosition.fromArray( parameters.cameraStartPosition );
		cameraEndPosition.fromArray( parameters.cameraEndPosition );
		cameraDeltaPosition.subVectors( cameraEndPosition, cameraStartPosition );	  

	};

	this.update = function ( t ) {

		camera.position.copy( cameraDeltaPosition );
		camera.position.multiplyScalar( t );
		camera.position.add( cameraStartPosition );
		
		renderer.render( scene, camera );

	};

};
