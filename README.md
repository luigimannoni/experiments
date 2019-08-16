[![Build Status](https://travis-ci.org/luigimannoni/experiments.svg?branch=master)](https://travis-ci.org/luigimannoni/experiments)

# ⚠️ WIP 
# WebGL/Javascript Experiments 🧪🔬

## List of Experiments

Below a list of the experiments contained in this repository and hosted on github pages

### Three.js

#### [Displacement Shader](https://experiments.luigimannoni.com/#/three/displacement)

The above experiment is a simple vertex displacement shader with a simple height fragment shader (eg, higher the displacement, brighter the emissive color of the mesh). Renderer has the [UnrealBloom](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) postprocess effect applied to it.

#### [GLTF Loader](https://experiments.luigimannoni.com/#/three/arc170)

Demo of the glTF™ (GL Transmission Format) file loader. [ARC-170 Fighter Model](https://sketchfab.com/3d-models/arc-170-fighter-d2b9834148e84c86a2423148db1f6705) by courtesy of SketchFab.

#### [Soundcloud Visualizer](https://experiments.luigimannoni.com/#/three/soundcloud-visualizer)

Music visualizer using AudioContext and Soundcloud APIs

### Babylonjs

#### [Simple postprocessing image shader](https://experiments.luigimannoni.com/#/babylon/image-postprocessing)

### Generic Javascript experiments

#### [MatterJS Repulsor](https://experiments.luigimannoni.com/#/javascript/matter-repulsor)

This MatterJS experiment uses springs on a grid to simulate a pattern and makes use of the matter-attractors base plugin with a custom function to reverse its attractor effect. 

---

## Local development

As usual `npm install` and `npm start` to run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Run `npm run build` builds the app for production to the `build` folder.
