import React from 'react';
import Base from '../Base';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import alphamap from './alphamap.jpg';
import particletexture from './particletextureshaded.png';

export default class Molecule extends Base {
  componentDidMount() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 3500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0x000000, 0 ); // background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const cubecam = new THREE.CubeCamera(0.1, 120, 26);
    cubecam.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter; // mipmap filter
    scene.add(cubecam);

    const controls = new TrackballControls( camera );
    controls.target = scene.position;
    controls.minDistance = 50;
    controls.maxDistance = 150;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry( 240, 32, 32 ),
      new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        side: THREE.BackSide,
      })
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight( 0xffffff );
    scene.add( light );

    const sun = new THREE.DirectionalLight( 0xcccccc, 1 );
    sun.position.set( 0, -128, -128 );
    scene.add( sun );

    const moon = new THREE.DirectionalLight( 0xfdB813, 1 );
    moon.position.set( 0, 128, 128 );
    scene.add( moon );

    camera.position.z = -120;
    //camera.lookAt(scene.position);


    // Sphere Glass Outer
    const sphereGlassOuter = new THREE.Mesh(
      new THREE.SphereGeometry( 46, 32, 32 ),
      new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        emissive: 0x000000,
        shininess: 100,
        opacity: 1,
      })
    );
    scene.add(sphereGlassOuter);

    // Sphere Core
    const sphereCore = new THREE.Mesh(
      new THREE.SphereGeometry( 20, 32, 32 ),
      new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        shininess: 0,
      })
    );
    scene.add(sphereCore);


    const renderModel = new RenderPass( scene, camera );
    const effectBloom = new UnrealBloomPass( THREE.Vector2( window.innerWidth, window.innerHeight ), 2.5, 2, 2 );

    const composer = new EffectComposer( renderer );

    composer.addPass( effectBloom );
    composer.addPass( renderModel );

    const render = function () {
      const time = performance.now() / 10e2;
      sun.position.y = Math.cos(time) * 250;
      moon.position.y = Math.cos(time) * -250;
      sun.position.z = Math.sin(time) * 250;
      moon.position.z = Math.sin(time) * -250;


      // sun.position.y = Math.cos(time) * 250;

      cubecam.update( renderer, scene );
      controls.update();
      composer.render();

      cubecam.position.x = camera.position.x;
      cubecam.position.y = camera.position.y;
      cubecam.position.z = camera.position.z;
      
      requestAnimationFrame(render);  
    };

    render();


    // Mouse and resize events
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset();
    }
    window.addEventListener('resize', onWindowResize, false);

  }

  render() {
    return <></>
  }
}
