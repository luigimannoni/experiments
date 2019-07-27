import React from 'react';
import Base from '../Base';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


export default class Arc170 extends Base {
  componentDidMount() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x222222, 0 ); // background

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Mesh
    const group = new THREE.Group();
    const loader = new THREE.ObjectLoader();
    
    loader.load('/assets/arc170/arc170.json', (geometry, materials) => {

      const faceMaterial = new THREE.MeshFaceMaterial( materials );

      const arcSpaceship = new THREE.Mesh(
        geometry,
        faceMaterial
      );

      arcSpaceship.receiveShadow = true;
      arcSpaceship.castShadow = true;

      // Grouping so I can play around later
      group.add(arcSpaceship);
    });

    scene.add(group);

    // Lights
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    const directionalLight = new THREE.DirectionalLight( 0xeeeeee, 1 );
    directionalLight.position.set( 1, 1, 1 );
    scene.add( directionalLight );
    camera.position.z = 1;


    const time = new THREE.Clock();

    const render = () => {
      // this.beforeRender();
      camera.lookAt(group.position);

      renderer.render(scene, camera);
      requestAnimationFrame(render);  
      // this.afterRender();
    };

    render();


    // Mouse and resize events
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
  }

  render() {
    return <></>
  }
}
