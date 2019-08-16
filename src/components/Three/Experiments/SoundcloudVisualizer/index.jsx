/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import raw from 'raw.macro';
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import * as SoundCloud from 'soundcloud-api-client';

import Base from '../Base';

import Palette from '../../../../libs/Palette';


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
      const _this = this;
      let analyser;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaElementSource(player);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const sampleAudioStream = function () {
        analyser.getByteFrequencyData(_this.streamData);

        let total = 0;
        for (var i = 0; i < 64; i++) {
          total += _this.streamData[i];
        }
        _this.volume = total;

        let totalLow = 0;
        for (var i = 0; i < 31; i++) {
          totalLow += _this.streamData[i];
        }
        _this.volumeLow = totalLow;

        let totalHi = 0;
        for (var i = 31; i < 64; i++) {
          totalHi += _this.streamData[i];
        }
        _this.volumeHi = totalHi;
      };

      setInterval(sampleAudioStream, 20);


      this.volume = 0;
      this.volumeLow = 0;
      this.volumeHi = 0;
      this.streamData = new Uint8Array(256);
      this.playStream = function (streamUrl) {
        player.addEventListener('ended', () => {
          _this.directStream('coasting');
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
      const SC_KEY = '26095b994cc185bc665f4c9fcce8f211';
      const soundcloud = new SoundCloud({
        client_id: SC_KEY,
      });

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
        const _this = this;

        soundcloud.get('/resolve', { url: track_url }, (sound) => {
          if (sound.errors) {
            _this.errorMessage = '';
            for (let i = 0; i < sound.errors.length; i++) {
              _this.errorMessage += `${sound.errors[i].error_message}<br>`;
            }
            _this.errorMessage
            += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
            errorCallback();
          } else if (sound.kind == 'playlist') {
            _this.sound = sound;
            _this.streamPlaylistIndex = 0;
            _this.streamUrl = function () {
              return (
                `${sound.tracks[_this.streamPlaylistIndex].stream_url
                }?client_id=${
                  SC_KEY}`
              );
            };
            successCallback();
          } else {
            _this.sound = sound;
            _this.streamUrl = function () {
              return `${sound.stream_url}?client_id=${SC_KEY}`;
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
          } else if (this.streamPlaylistIndex <= 0) { this.streamPlaylistIndex = this.sound.track_count - 1; } else this.streamPlaylistIndex--;
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
    const player = document.querySelector('player');
    const loader = new SoundcloudLoader(player);

    const audioSource = new SoundCloudAudioSource(player);

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


    if (window.location.hash) {
      var trackUrl = `https://soundcloud.com/${window.location.hash.substr(1)}`;
      loadAndUpdate(trackUrl);
    } else {
      var trackUrl = 'https://soundcloud.com/' + 'shockone/polygon-shockone-vip';
      loadAndUpdate(trackUrl);
    }


    function deg2rad(_degrees) {
      return _degrees * Math.PI / 180;
    }


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
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    const group = new THREE.Group();
    scene.add(group);


    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);


    const planeGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      ambient: 0x000000,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.y = -2;
    plane.rotation.x = deg2rad(-90);

    scene.add(plane);


    const cubeDimension = 45;
    const cubeRows = 9;
    const cubeColumns = 9;
    const cubePadding = 3;
    const cubes = [];
    const cubesWireframe = [];
    const cubesLight = [];
    const cubeGeometry = new THREE.BoxGeometry(cubeDimension, 1, cubeDimension);

    for (let column = 0; column < cubeColumns; column++) {
      for (let row = 0; row < cubeRows; row++) {
        var cube = new THREE.Mesh(
          cubeGeometry,
          new THREE.MeshLambertMaterial({
            color: 0x2c75ff,
            ambient: 0x2222c8,
            transparent: true,
            shininess: 85,
            opacity: 0.05,
          }),
        );

        cube.position.x = column * cubeDimension + cubePadding * column;
        cube.position.z = row * cubeDimension + cubePadding * row;

        group.add(cube);
        cubes.push(cube);

        var cube = new THREE.Mesh(
          cubeGeometry,
          new THREE.MeshLambertMaterial({
            color: 0x2c75ff,
            ambient: 0x2222c8,
            transparent: false,
            wireframe: true,
            wireframeLinewidth: 4,
          }),
        );

        cube.position.x = column * cubeDimension + cubePadding * column;
        cube.position.z = row * cubeDimension + cubePadding * row;

        group.add(cube);

        cubesWireframe.push(cube);
      }
    }

    camera.position.z = -65;
    camera.position.y = 65;


    const time = new THREE.Clock();
    const centerCube = 40;

    var render = function () {
      camera.position.x = Math.cos(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.x;
      camera.position.z = Math.sin(time.getElapsedTime() / 4) * 350 + cubes[centerCube].position.z;

      const mental = Math.min(
        Math.max(Math.tan(audioSource.volumeHi / 6500) * 0.5),
        2,
      );

      camera.position.y = 65 + 120 * mental;

      for (let i = audioSource.streamData.length - 1; i >= 0; i--) {
        if (cubes[i]) {
          const currentAudioChannelVolume = audioSource.streamData[i];

          cubes[i].scale.y = (currentAudioChannelVolume + 0.1) / 3;
          cubes[i].position.y = (currentAudioChannelVolume + 0.1) / 3 / 2;

          cubes[i].scale.x = 1 / 255 * (255 - currentAudioChannelVolume / 1.5);
          cubes[i].scale.z = 1 / 255 * (255 - currentAudioChannelVolume / 1.5);

          cubes[i].material.color.setHSL(
            0.27 / 255 * (255 - currentAudioChannelVolume),
            1,
            0.6,
          );
          cubes[i].material.ambient.setHSL(
            0.27 / 255 * (255 - currentAudioChannelVolume),
            1,
            0.5,
          );
          cubes[i].material.opacity = 1 / 255 * currentAudioChannelVolume;


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

      plane.material.ambient.setHSL(0, 0, mental);


      renderer.render(scene, camera);
      camera.lookAt(cubes[centerCube].position);


      requestAnimationFrame(render);
    };

    render();


    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      composer.reset();
    }


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
    return (
      <>
        <audio preload loop autoPlay />
      </>
    );
  }
}
