import React from 'react';
import Base from '../Base';
import raw from 'raw.macro';

import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const vertex = raw('./vertex.glsl');
const fragment = raw('./fragment.glsl');

const PALETTE = {
  CYAN: 0x33a7cc, // (85,231,255)
  BLUE: 0x00ccfd, // (0,204,253)
  PURPLE: 0xff34b3, // (255,52,179)
  DARKBLUE: 0x2011a2, // (32,17,162)
  DEEPBLUE: 0x201148, // (32,17,72)
};

const PARAMS = {
  EXP: 1,
  STR: .9,
  THRES: 0,
  RAD: 2,
};

export default class Displacement extends Base {
  renderer = null;

  componentDidMount() {
    super.componentDidMount();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 3500);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor( 0x000000, 0 ); // background
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const controls = new TrackballControls( camera );
    controls.target = scene.position;
    controls.minDistance = 125;
    controls.maxDistance = 225;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry( 350, 32, 32 ),
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



    camera.position.z = -120;

    const uniforms = {
      time: {
        value: 1.0
      },
      scale: {
        value: 1.0
      },
      speed: {
        type: 'f',
        value: 0.1,
      },
      displacement: {
        type: 'f',
        value: 12.0,
      },
      vNoise: {
        type: 'f',
        value: 0,
      },
      color: {
        type: 'c',
        value: new THREE.Color(PALETTE.BLUE),
      },           
    };


    const BlobShader = new THREE.ShaderMaterial({ 
      vertexShader: vertex,
      fragmentShader: fragment,      
      uniforms,
    });


    // Sphere Glass Outer
    const Blob = new THREE.Mesh(
      new THREE.DodecahedronGeometry( 46, 3 ),
      BlobShader
    );
    scene.add(Blob);

    const renderPass = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );

    bloomPass.exposure = PARAMS.EXP;
    bloomPass.threshold = PARAMS.THRES;
    bloomPass.strength = PARAMS.STR;
    bloomPass.radius = PARAMS.RAD;

    const composer = new EffectComposer( this.renderer );

    composer.addPass( renderPass );
    composer.addPass( bloomPass );


    const render = () => {
      super.beforeRender();

      const time = performance.now() / 10e3;
      
      sun.position.x = Math.sin(Math.sin(time)) * 250;
      sun.position.y = Math.sin(Math.cos(time)) * 250;
      sun.position.z = Math.sin(time) * 250;

      moon.position.x = Math.sin(time) * -250;
      moon.position.y = Math.cos(time) * -250;
      moon.position.z = Math.cos(Math.sin(time)) * -250;

      bloomPass.exposure = Math.abs(Math.cos(time)) * .5;
      bloomPass.strength = Math.abs(Math.cos(time)) * .2 + .5;

      uniforms.time.value = time / 5;
      const un = Math.cos(time / 1) + 1;

      uniforms.scale.value = 1;

      uniforms.displacement.value = 10;
      uniforms.vNoise.value = un * 5 + 2;
      uniforms.speed.value = 10;


      controls.update();
      composer.render();

      super.afterRender();
      
      super.raf = requestAnimationFrame(render);  
    };

    render();


    // Mouse and resize events
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset();
    }
    window.addEventListener('resize', onWindowResize, false);


    // Adds GUI stuff
    const gui = super.gui();
    gui.add(uniforms.time, 'value', 0, 100);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>
  }
}
