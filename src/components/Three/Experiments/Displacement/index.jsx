import React from "react";
import raw from "raw.macro";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import Base from "../Base";

import Palette from "../../../../libs/Palette";

const vertex = raw("./vertex.glsl");
const fragment = raw("./fragment.glsl");

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

export default class Displacement extends Base {
  constructor() {
    super({ tweakpane: true });
    this.renderer = null;
  }

  componentDidMount() {
    super.componentDidMount();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 0); // background
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const controls = new TrackballControls(camera, this.renderer.domElement);
    controls.target = scene.position;
    controls.minDistance = 125;
    controls.maxDistance = 225;

    // Background
    const background = new THREE.Mesh(
      new THREE.SphereGeometry(350, 32, 32),
      new THREE.MeshStandardMaterial({
        color: COLORS.LIGHT_2,
        side: THREE.BackSide,
      })
    );
    scene.add(background);

    // Lights
    const light = new THREE.AmbientLight(0x8);
    scene.add(light);

    const l1 = new THREE.PointLight(COLORS.LIGHT_1, 0.5);
    l1.position.set(0, -200, -200);
    scene.add(l1);

    const l2 = new THREE.PointLight(COLORS.LIGHT_2, 1.5);
    l2.position.set(0, 200, 200);
    scene.add(l2);

    camera.position.z = -120;

    const uniforms = {
      time: {
        value: 1.0,
      },
      scale: {
        value: 1.0,
      },
      speed: {
        type: "f",
        value: 20.0,
      },
      displacement: {
        type: "f",
        value: 12.0,
      },
      lowStep: {
        type: "f",
        value: -1,
      },
      hiStep: {
        type: "f",
        value: 1,
      },
      vNoise: {
        type: "f",
        value: 0,
      },
      color: {
        type: "c",
        value: new THREE.Color(COLORS.PLASMA),
      },
    };

    const BlobShader = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
    });

    // Sphere Glass Outer
    const Blob = new THREE.Mesh(
      new THREE.DodecahedronBufferGeometry(46, 64),
      BlobShader
    );
    scene.add(Blob);

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );

    bloomPass.threshold = BLOOM.THRES;
    bloomPass.strength = BLOOM.STR;
    bloomPass.radius = BLOOM.RAD;

    const composer = new EffectComposer(this.renderer);

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const render = () => {
      super.beforeRender();

      const time = performance.now() / 10e3;

      l1.position.x = Math.sin(Math.sin(time)) * 250;
      l1.position.y = Math.sin(Math.cos(time)) * 250;
      l1.position.z = Math.sin(time) * 250;

      l2.position.x = Math.sin(time) * -250;
      l2.position.y = Math.cos(time) * -250;
      l2.position.z = Math.cos(Math.sin(time)) * -250;

      if (BLOOM.ANIMATE) {
        this.renderer.toneMappingExposure = Math.abs(Math.cos(time) / 2) + 0.5;
        bloomPass.strength = Math.abs(Math.cos(time)) + 0.5;
        bloomPass.radius = Math.abs(Math.sin(time)) + 0.5;
      }

      uniforms.time.value = time / 5;

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
    };
    window.addEventListener("resize", onWindowResize, false);

    const recolor = () => {
      uniforms.color.value = new THREE.Color(COLORS.PLASMA);
      if (COLORS.EQUALIZE) {
        l1.color = new THREE.Color(COLORS.PLASMA);
        l2.color = new THREE.Color(COLORS.PLASMA);
      } else {
        l1.color = new THREE.Color(COLORS.LIGHT_1);
        l2.color = new THREE.Color(COLORS.LIGHT_2);
      }
    };

    // Adds Pane stuff
    const pane = super.pane();

    const paneShader = pane.addFolder({ title: "Shader uniforms" });
    paneShader.addInput(uniforms.scale, "value", {
      min: 0,
      max: 2,
      step: 0.01,
      label: "Scale",
    });
    paneShader.addInput(uniforms.displacement, "value", {
      min: 0,
      max: 110,
      label: "Displacement",
    });
    paneShader.addInput(uniforms.speed, "value", {
      min: 10,
      max: 50,
      label: "Speed",
    });
    paneShader.addInput(uniforms.lowStep, "value", {
      min: -2,
      max: 0,
      label: "Low step",
    });
    paneShader.addInput(uniforms.hiStep, "value", {
      min: 0,
      max: 2,
      label: "High step",
    });

    const paneColor = pane.addFolder({ title: "Color Settings" });
    paneColor
      .addInput(COLORS, "PLASMA", { view: "color", label: "Ball" })
      .on("change", recolor);
    const c1 = paneColor
      .addInput(COLORS, "LIGHT_1", {
        view: "color",
        disabled: COLORS.EQUALIZE,
        label: "Background Shadows",
      })
      .on("change", recolor);
    const c2 = paneColor
      .addInput(COLORS, "LIGHT_2", {
        view: "color",
        disabled: COLORS.EQUALIZE,
        label: "Background Lights",
      })
      .on("change", recolor);
    paneColor
      .addInput(COLORS, "EQUALIZE", { label: "Equalize colors" })
      .on("change", () => {
        c1.disabled = COLORS.EQUALIZE;
        c2.disabled = COLORS.EQUALIZE;
        recolor();
      });

    const paneBloom = pane.addFolder({ title: "Bloom Effect" });
    const b1 = paneBloom.addInput(this.renderer, "toneMappingExposure", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "Exposure",
      disabled: BLOOM.ANIMATE,
    });
    paneBloom.addInput(bloomPass, "threshold", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "Threshold",
    });
    const b2 = paneBloom.addInput(bloomPass, "strength", {
      min: 0,
      max: 2,
      step: 0.1,
      label: "Strength",
      disabled: BLOOM.ANIMATE,
    });
    const b3 = paneBloom.addInput(bloomPass, "radius", {
      min: 0,
      max: 2,
      step: 0.1,
      label: "Radius",
      disabled: BLOOM.ANIMATE,
    });
    paneBloom
      .addInput(BLOOM, "ANIMATE", { label: "Animate" })
      .on("change", () => {
        b1.disabled = BLOOM.ANIMATE;
        b2.disabled = BLOOM.ANIMATE;
        b3.disabled = BLOOM.ANIMATE;
      });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.renderer.domElement.remove();
  }

  render() {
    return <></>;
  }
}
