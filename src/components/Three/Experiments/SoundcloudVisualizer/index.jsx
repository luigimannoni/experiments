import React from 'react';
import raw from 'raw.macro';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import Base from '../Base';

import Palette from '../../../../libs/Palette';

// const vertex = raw('./vertex.glsl');
// const fragment = raw('./fragment.glsl');

const COLORS = {
  LIGHT: Palette.Synth.lighter,
  PLASMA: Palette.Synth.light,
  BACKGROUND: Palette.Synth.dark,
  LIGHT_1: Palette.Synth.normal,
  LIGHT_2: Palette.Synth.darker,
  EQUALIZE: false,
};

const BLOOM = {
  ANIMATE: true,
  EXP: 1,
  STR: 0.9,
  THRES: 0,
  RAD: 2,
};

export default class SoundcloudVisualizer extends Base {
  constructor(...args) {
    super(...args);
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();


    const SoundCloudAudioSource = function (player) {
      const self = this;
      let analyser;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaElementSource(player);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const sampleAudioStream = function () {
        analyser.getByteFrequencyData(self.streamData);
        // Calculate an overall volume value
        let total = 0;
        for (var i = 0; i < 64; i++) {
          // Get the volume from the first 64 bins
          total += self.streamData[i];
        }
        self.volume = total;

        let totalLow = 0;
        for (var i = 0; i < 31; i++) {
          // Get the volume from the first 32 bins
          totalLow += self.streamData[i];
        }
        self.volumeLow = totalLow;

        let totalHi = 0;
        for (var i = 31; i < 64; i++) {
          // Get the volume from the second 32 bins
          totalHi += self.streamData[i];
        }
        self.volumeHi = totalHi;
      };

      setInterval(sampleAudioStream, 20);

      // Public properties and methods
      this.volume = 0;
      this.volumeLow = 0;
      this.volumeHi = 0;
      this.streamData = new Uint8Array(256);
      this.playStream = function (streamUrl) {
        // Get the input stream from the audio element
        player.addEventListener('ended', () => {
          self.directStream('coasting');
        });
        player.crossOrigin = 'anonymous';
        player.setAttribute('src', streamUrl);
        player.play();
      };
    };
    const Visualizer = function () {
      let audioSource;
      this.init = function (options) {
        audioSource = options.audioSource;
        const container = document.getElementById(options.containerId);
      };
    };

    const SoundcloudLoader = function (player, uiUpdater) {
      const self = this;
      const client_id = '26095b994cc185bc665f4c9fcce8f211'; // to get an ID go to https://developers.soundcloud.com/
      this.sound = {};
      this.streamUrl = '';
      this.errorMessage = '';
      this.player = player;

      /**
     * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
     * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
     * @param track_url
     * @param callback
     */
      this.loadStream = function (track_url, successCallback, errorCallback) {
        SC.initialize({
          client_id,
        });
        SC.get('/resolve', { url: track_url }, (sound) => {
          if (sound.errors) {
            self.errorMessage = '';
            for (let i = 0; i < sound.errors.length; i++) {
              self.errorMessage += `${sound.errors[i].error_message  }<br>`;
            }
            self.errorMessage
            += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
            errorCallback();
          } else if (sound.kind == "playlist") {
            self.sound = sound;
            self.streamPlaylistIndex = 0;
            self.streamUrl = function() {
              return (
                sound.tracks[self.streamPlaylistIndex].stream_url +
                "?client_id=" +
                client_id
              );
            };
            successCallback();
          } else {
            self.sound = sound;
            self.streamUrl = function() {
              return sound.stream_url + "?client_id=" + client_id;
            };
            successCallback();
          }
        });
      };

      this.directStream = function (direction) {
        if (direction == 'toggle') {
          if (this.player.paused) {
            this.player.play();
          } else {
            this.player.pause();
          }
        } else if (this.sound.kind == 'playlist') {
          if (direction == 'coasting') {
            this.streamPlaylistIndex++;
          } else if (direction == 'forward') {
            if (this.streamPlaylistIndex >= this.sound.track_count - 1) { this.streamPlaylistIndex = 0; } else this.streamPlaylistIndex++;
          } else if (this.streamPlaylistIndex <= 0) {this.streamPlaylistIndex = this.sound.track_count - 1;}
          else this.streamPlaylistIndex--;
          if (
            this.streamPlaylistIndex >= 0
          && this.streamPlaylistIndex <= this.sound.track_count - 1
          ) {
            this.player.setAttribute('src', this.streamUrl());
            this.player.play();
          }
        }
      };
    };

    const visualizer = new Visualizer();
    const player = document.getElementById('player');
    const loader = new SoundcloudLoader(player);

    let audioSource = new SoundCloudAudioSource(player);
    const form = document.getElementById('form');
    const loadAndUpdate = function (trackUrl) {
      loader.loadStream(
        trackUrl,
        () => {
          audioSource.playStream(loader.streamUrl());
        },
        () => {},
      );
    };

    visualizer.init({
      containerId: 'visualizer',
      audioSource,
    });

    // On load, check to see if there is a track token in the URL, and if so, load that automatically
    if (window.location.hash) {
      var trackUrl = `https://soundcloud.com/${  window.location.hash.substr(1)}`;
      loadAndUpdate(trackUrl);
    } else {
      var trackUrl = 'https://soundcloud.com/' + 'shockone/polygon-shockone-vip';
      loadAndUpdate(trackUrl);
    }

    // Since I suck at trigonometry I'll just convert radii into degrees.
    function deg2rad(_degrees) {
      return _degrees * Math.PI / 180;
    }

    // Init values
    let mouseX = 0;
    let mouseY = 0;
    let composer;
    let controls;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      5000,
    );
    scene.fog = new THREE.Fog(0x000000, 600, 1500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 0); // background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ditching controls in favour of an automatic camera.
    // controls = new THREE.TrackballControls( camera );

    // I don't think we need this group, I used to rotate the entire group back then... just left there in case I want to reuse that again
    const group = new THREE.Group();
    scene.add(group);

    // Ambient Light
    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    // Strobo plane
    const planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      ambient: 0x000000,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = -2;
    plane.rotation.x = deg2rad(-90);

    scene.add(plane);

    // I'll create a matrix of cubes with the settings below.
    const cubeDimension = 45;
    let cubeRows = 9;
    let cubeColumns = 9;
    let cubePadding = 3;
    let cubes = []; // Don't ask me why, but I needed to initialize this array. This will accomodate each single object
    let cubesWireframe = []; // I clone the same object using a different material since I can't use multimaterials anymore, so yes, one cube are in reality two cubes.
    let cubesLight = []; // Yes, the cubes used to cast lights and shadows until my machine exploded.
    const cubeGeometry = new THREE.BoxGeometry(cubeDimension, 1, cubeDimension);

    for (let column = 0; column < cubeColumns; column++) {
      // Column cycle
      for (let row = 0; row < cubeRows; row++) {
        // Row cycle

        // First cube
        var cube = new THREE.Mesh(
          cubeGeometry,
          new THREE.MeshLambertMaterial({
            // Note: I have to directly create the material object into the mesh, if I define the material before I can't change this indepedently.
            color: 0x2c75ff, // That's a blue colour, I used this to debug and just left.
            ambient: 0x2222c8,
            transparent: true,
            shininess: 85,
            opacity: 0.05, // It will change on runtime anyway.
          }),
        );

        cube.position.x = column * cubeDimension + cubePadding * column; // Position it
        cube.position.z = row * cubeDimension + cubePadding * row;

        group.add(cube); // Aaaaah, here it is, yes this should add into the scene the cube automatically
        cubes.push(cube); // And I add the cube into the array since I will be destroying this object shortly

        var cube = new THREE.Mesh(
          cubeGeometry, // Old cube var is gone by now, I use a new one to build the wireframe around it
          new THREE.MeshLambertMaterial({
            color: 0x2c75ff,
            ambient: 0x2222c8,
            transparent: false,
            wireframe: true,
            wireframeLinewidth: 4, // Take note: this does NOT work on Windows machines :(
          }), // Same as before
        );

        cube.position.x = column * cubeDimension + cubePadding * column;
        cube.position.z = row * cubeDimension + cubePadding * row;

        group.add(cube); // See above

        cubesWireframe.push(cube); // See above
      }
    }

    camera.position.z = -65;
    camera.position.y = 65; // Some initial positioning of the camera, it will be rewritten on runtime

    // Some post processing, fiddle around with these values to give it different FX
    // var renderModel = new THREE.RenderPass( scene, camera );
    // var effectBloom = new THREE.BloomPass( 1.5, 2, 0.01, 1024 );
    // var effectFilm = new THREE.FilmPass( 0.3, 0.3, 1024, false );

    // Applying composer
    // effectFilm.renderToScreen = true;

    // composer = new THREE.EffectComposer( renderer );

    // composer.addPass( renderModel );
    // composer.addPass( effectBloom );
    // composer.addPass( effectFilm );

    const time = new THREE.Clock();
    const centerCube = 40;
    // Render function
    var render = function () {
      camera.position.x = Math.cos(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.x; // X Cos wave around the center cube (I know, I should calculate the center of the group instead)
      camera.position.z = Math.sin(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.z; // Z Sin wave around center cube, now my camera goes around. PS. 350 is the distance of the camera.

      if (audioCtxCheck) {
        // I recycled the mental var, this should go from 0 to 1 and jumps in between with the music
        // It's not an ideal beat detector but it works!
        const mental = Math.min(
          Math.max(Math.tan(audioSource.volumeHi / 6500) * 0.5),
          2,
        );

        camera.position.y = 65 + 120 * mental; // Make the camera bounce on rhythm

        for (var i = audioSource.streamData.length - 1; i >= 0; i--) {
          // My error here is: I am still doing a full cycle for the streamData array while I should pick only as many channel as my cube matrix
          // I have left this just in case I wanted to increase the data channels
          if (cubes[i]) {
            // Need to save javascript into crashing

            const currentAudioChannelVolume = audioSource.streamData[i]; // Makes more sense than streamData

            cubes[i].scale.y = (currentAudioChannelVolume + 0.1) / 3; // Makes cube taller with the volume
            cubes[i].position.y = (currentAudioChannelVolume + 0.1) / 3 / 2; // Since scale works in 2 ways (Y axis and -Y axis) I compensate by applying half position onto the Y axis

            cubes[i].scale.x = 1 / 255 * (255 - currentAudioChannelVolume / 1.5); // Makes the cube thinner when louder and fatter when no volume is hitting the channel,
            cubes[i].scale.z = 1 / 255 * (255 - currentAudioChannelVolume / 1.5); // 1.5 at the end should restrict the scale at roughly 70% otherwise high volumes becomes lines

            cubes[i].material.color.setHSL(
              0.27 / 255 * (255 - currentAudioChannelVolume),
              1,
              0.6,
            ); // HSL color wheel, 0.27 (100 degrees) is green from silence to 0 (red)
            cubes[i].material.ambient.setHSL(
              0.27 / 255 * (255 - currentAudioChannelVolume),
              1,
              0.5,
            );
            cubes[i].material.opacity = 1 / 255 * currentAudioChannelVolume;

            // Same stuff as above but for the wireframe cubes so they will have similar size.
            cubesWireframe[i].scale.y = (currentAudioChannelVolume + 0.1) / 3;
            cubesWireframe[i].scale.x = 1 / 255 * (255 - currentAudioChannelVolume / 1.5);
            cubesWireframe[i].scale.z = 1 / 255 * (255 - currentAudioChannelVolume / 1.5);

            cubesWireframe[i].position.y = (currentAudioChannelVolume + 0.1) / 3 / 2;

            cubesWireframe[i].material.color.setHSL(
              0.27 / 255 * (255 - currentAudioChannelVolume),
              1,
              0.6,
            );
            cubesWireframe[i].material.ambient.setHSL(
              0.27 / 255 * (255 - currentAudioChannelVolume),
              1,
              0.5,
            );
          }
        }

        plane.material.ambient.setHSL(0, 0, mental); // HSL

        // controls.update(); // Uncomment this if you want to enable controls
        renderer.render(scene, camera); // Uncomment this if you want to switch off postprocessing
      } else {
        for (var i = cubes.length - 1; i >= 0; i--) {
          cubes[i].scale.y = Math.sin(time.getElapsedTime() + i / cubes.length) * 30 + 30.01;
          cubes[i].position.y = (Math.sin(time.getElapsedTime() + i / cubes.length) * 30 + 30.01) / 2;

          cubesWireframe[i].scale.y = Math.sin(time.getElapsedTime() + i / cubes.length) * 30 + 30.01;
          cubesWireframe[i].position.y = (Math.sin(time.getElapsedTime() + i / cubes.length) * 30 + 30.01) / 2;
        }
      }
      camera.lookAt(cubes[centerCube].position); // Comment this if you want to enable controls, otherwise it crashes badly

      // renderer.clear(); // Comment this if you want to switch off postprocessing
      // composer.render(time.getElapsedTime()); // Comment this if you want to switch off postprocessing

      requestAnimationFrame(render);
    };

    render(); // Ciao

    // Mouse and resize events
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset(); // Comment this if you want to switch off postprocessing
    }

    // Not used, but I leave this on my templates if I want a slight camera panning
    function onDocumentMouseMove(event) {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
