[![Build Status](https://travis-ci.org/luigimannoni/experiments.svg?branch=master)](https://travis-ci.org/luigimannoni/experiments)

# WebGL/Javascript Experiments 🧪🔬 (⚠️ WIP )

## List of Experiments

Below a list of the experiments contained in this repository and hosted on github pages

### Three.js

#### [Displacement Shader](https://experiments.luigimannoni.com/#/three/displacement)

The above experiment is a simple vertex displacement shader with a simple height fragment shader (eg, higher the displacement, brighter the emissive color of the mesh). Renderer has the [UnrealBloom](https://threejs.org/examples/webgl_postprocessing_unreal_bloom.html) postprocess effect applied to it.

#### [GLTF Loader](https://experiments.luigimannoni.com/#/three/arc170)

Demo of the glTF™ (GL Transmission Format) file loader. [ARC-170 Fighter Model](https://sketchfab.com/3d-models/arc-170-fighter-d2b9834148e84c86a2423148db1f6705) by courtesy of SketchFab.

#### [Soundcloud Visualizer](https://experiments.luigimannoni.com/#/three/soundcloud-visualizer)

Music visualizer using AudioContext and Soundcloud APIs.
Uses an `<audio>` tag to load and play the source and read the stream from there. The current experiment uses autoplay and might not work on mobile devices without user interation.

### Babylonjs

#### [Image Processing](https://experiments.luigimannoni.com/#/babylon/image-processing)

Apply some postprocess effects to a texture image using a single shader. 


#### [Shader Layering](https://experiments.luigimannoni.com/#/babylon/shader-layering)

Multiple shaders layered on top of each other to build up a complex scene, the main globe shader has two diffuse maps shifting between each other.

### Generic Javascript experiments

#### [MatterJS Repulsor](https://experiments.luigimannoni.com/#/javascript/matter-repulsor)

This MatterJS experiment uses springs on a grid to simulate a pattern and makes use of the matter-attractors base plugin with a custom function to reverse its attractor effect. 

---

## Local development

As usual `npm install` and `npm start` to run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Run `npm run build` builds the app for production to the `build` folder.
