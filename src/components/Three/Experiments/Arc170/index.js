import React from 'react';
import Base from '../Base';

import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const PALETTE = {
  CYAN: 0x55e7ff, // (85,231,255)
  BLUE: 0x00ccfd, // (0,204,253)
  PURPLE: 0xff34b3, // (255,52,179)
  DARKBLUE: 0x2011a2, // (32,17,162)
  DEEPBLUE: 0x201148, // (32,17,72)
};

export default class Arc170 extends Base {
  componentDidMount() {
    super.componentDidMount();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

    camera.position.x = -220;
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x222222, 0 ); // background

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    const controls = new TrackballControls( camera );
    controls.target = scene.position;
    controls.minDistance = 50;
    controls.maxDistance = 300;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry( 312, 32, 32 ),
      new THREE.MeshStandardMaterial({ 
        color: PALETTE.DEEPBLUE,
        side: THREE.BackSide,
      })
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight( 0x8 );
    scene.add( light );

    const sun = new THREE.PointLight( PALETTE.PURPLE, .5 );
    sun.position.set( 0, -200, -200 );
    scene.add( sun );

    const moon = new THREE.PointLight( PALETTE.DEEPBLUE, 1.5 );
    moon.position.set( 0, 200, 200 );
    scene.add( moon );


    // Mesh
    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/assets/arc170/arc170.glb`, (gltf) => {
      scene.add( gltf.scene );
    });

    const render = () => {
      super.beforeRender();      

      controls.update();
      renderer.render(scene, camera);


      super.afterRender();      
      super.raf = requestAnimationFrame(render);  
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
