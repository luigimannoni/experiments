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
  CYAN: 0x55e7ff, // (85,231,255)
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

export default class Molecule extends Base {
  componentDidMount() {
    console.log(vertex, fragment);
    Base.prototype.componentDidMount();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 3500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor( 0x000000, 0 ); // background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog( 0x0, 500, 500 );

    const controls = new TrackballControls( camera );
    controls.target = scene.position;
    controls.minDistance = 50;
    controls.maxDistance = 150;

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

    camera.position.z = -120;
    //camera.lookAt(scene.position);



    const uniforms = {
      time: { value: 1.0 },
      scale: { value: new THREE.Vector2(1, 1) },
      cameraposition: { value: new THREE.Vector3(0., 0., 0.) },
      speed: {
        type: 'f',
        value: 0.1,
      },
      texScale: {
        type: 'f',
        value: 12.0,
      },
      elevation: {
        type: 'f',
        value: 1,
      },
      noise_range: {
        type: 'f',
        value: 0,
      },
      offset: {
        type: 'f',
        value: 1,
      },
      perlin_passes: {
        type: 'f',
        value: 1,
      },
      sombrero_amplitude: {
        type: 'f',
        value: 0.3,
      },
      sombrero_frequency: {
        type: 'f',
        value: 10.0,
      },
      line_color: {
        type: 'c',
        value: new THREE.Color('#ffffff'),
      },
      fogColor: {
        type: 'c',
        value: scene.fog.color,
      },
      fogNear: {
        type: 'f',
        value: scene.fog.near,
      },
      fogFar: {
        type: 'f',
        value: scene.fog.far,
      },
      screenWidth: {
        type: 'f',
        value: window.innerWidth,
      },
      screenHeight: {
        type: 'f',
        value: window.innerHeight,
      },
      fog: {
        value: true,
      },
      pointsize: {
        type: 'f',
        value: 25.,
      },
      mouse: {
        value: new THREE.Vector2(.5, .5)
      }
    };

    const customShader = new THREE.ShaderMaterial({
      uniforms,
      fog: true,
      transparent: true,
      alphaTest: 0,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    // Sphere Glass Outer
    const SphereOuter = new THREE.Mesh(
      new THREE.DodecahedronGeometry( 46, 3 ),
      customShader
      // new THREE.MeshPhongMaterial({ 
      //   color: PALETTE.PURPLE,
      //   specular: PALETTE.DARKBLUE,
      //   emissive: 0x0,
      //   shininess: 15,
      //   opacity: 1,
      // })
    );
    scene.add(SphereOuter);

    const SphereOuterWire = new THREE.Mesh(
      new THREE.DodecahedronGeometry( 46.2, 3 ),
      customShader
      // new THREE.MeshPhongMaterial({ 
      //   color: PALETTE.PURPLE,
      //   specular: 0xffffff,
      //   emissive: 0x0,
      //   shininess: 50,
      //   opacity: 1,
      //   wireframe: true,
      //   wireframeLinewidth: 3,
      // })
    );
    // scene.add(SphereOuterWire);


    const renderPass = new RenderPass( scene, camera );
    const bloomPass = new UnrealBloomPass( THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );

    bloomPass.exposure = PARAMS.EXP;
    bloomPass.threshold = PARAMS.THRES;
    bloomPass.strength = PARAMS.STR;
    bloomPass.radius = PARAMS.RAD;

    const composer = new EffectComposer( renderer );

    composer.addPass( renderPass );
    composer.addPass( bloomPass );

    console.log(SphereOuterWire.material);

    const render = function () {
      Base.prototype.beforeRender();

      const time = performance.now() / 10e3;
      
      sun.position.x = Math.sin(Math.sin(time)) * 250;
      sun.position.y = Math.sin(Math.cos(time)) * 250;
      sun.position.z = Math.sin(time) * 250;

      moon.position.x = Math.sin(time) * -250;
      moon.position.y = Math.cos(time) * -250;
      moon.position.z = Math.cos(Math.sin(time)) * -250;


      SphereOuterWire.rotation.x += Math.abs(Math.cos(time)) / 2e2;
      SphereOuterWire.rotation.y += Math.abs(Math.sin(time)) / 2e2;
      SphereOuterWire.rotation.z += Math.abs(Math.sin(Math.cos(time))) / 2e2;

      SphereOuterWire.material.wireframeLinewidth = Math.abs(Math.cos(time)) * 5;

      bloomPass.exposure = Math.abs(Math.cos(time)) * 1;
      // bloomPass.threshold = Math.abs(Math.cos(time*2)) * 2;
      bloomPass.strength = Math.abs(Math.cos(time)) * 2;
      bloomPass.radius = Math.abs(Math.cos(time*2)) * 1.5;

      uniforms.time.value = time / 5;
      const un = Math.cos(time / 1) + 1;
      const unhalf = Math.sin(time / 2);
      uniforms.elevation.value = 0;

      uniforms.line_color.value = new THREE.Color(0xffffff);
      uniforms.sombrero_frequency.value = unhalf * 2 + 15;
      uniforms.sombrero_amplitude.value = un * 4 + 4;
      uniforms.elevation.value = unhalf * 2;
      uniforms.noise_range.value = un * 5 + 2;
      uniforms.speed.value = 10;
      uniforms.offset.value = time;
      uniforms.cameraposition.value = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);


      controls.update();
      composer.render();

      Base.prototype.afterRender();
      
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
