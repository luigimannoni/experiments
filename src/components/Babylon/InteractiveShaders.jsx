import { useEffect, useRef } from "react";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  Mesh,
  Effect,
  ShaderMaterial,
  Texture,
  Color3,
  Vector2,
} from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import vertex from "./shaders/vertex.glsl.js";
import fragment from "./shaders/fragment.glsl.js";
import { useControls } from "leva";

const COLORS = {
  TARGET: "#a88ead",
  WAVE: "##b76fb7",
};

export default function InteractiveShaders() {
  let material;

  const imageList = {
    Leaves: "/assets/textures/generic/leaves.png",
    Building: "/assets/textures/generic/building.jpg",
    Chamber: "/assets/textures/generic/chamber.jpg",
    Plants: "/assets/textures/generic/plants.jpg",
    Road: "/assets/textures/generic/road.jpg",
    Radios: "/assets/textures/generic/radios.jpg",
  };
  const modeList = {
    Crossfade: 7,
    "Sine Crossfade": 0,
    "Box Crossblur": 3,
    Greyscale: 4,
    Overlay: 8,
    // Mirror: 12,
    "Channel 1 only": 1,
    "Channel 2 only": 2,
  };

  const options = useControls({
    // shaderMode: 0,
    iterations: {
      label: "Iterations",
      value: 2,
      onChange: (v) => material.setInt("iterations", v),
      min: 1,
      max: 4,
      step: 1,
    },
    // vIterations: 2,
    // channel1: imageList.Leaves,
    // channel2: imageList.Plants,
    speed: {
      label: "Time speed",
      value: 1.0,
      onChange: (v) => material.setFloat("speed", v),
      min: -5,
      max: 5,
      step: 0.1,
    },
    // target: {
    //   label: "Base color",
    //   value: COLORS.TARGET,
    //   onChange: (v) => material.setColor3("target", Color3.FromHexString(v)),
    // },
    // wave: {
    //   label: "Overlay color",
    //   value: COLORS.WAVE,
    //   onChange: (v) => material.setColor3("wave", Color3.FromHexString(v)),
    // },
    scale: {
      value: [1, 1],
      onChange: (v) => material.setVector2("scale", new Vector2(v[0], v[1])),
      min: 1,
      max: 6,
    },
  });

  const onSceneReady = (scene) => {
    const camera = new ArcRotateCamera(
      "camera1",
      0,
      0,
      100,
      new Vector3(0, 0, 0),
      scene
    );
    camera.setPosition(new Vector3(200, 100, -200));
    camera.orthoTop = 1;
    camera.orthoBottom = -1;
    camera.orthoRight = 1;
    camera.orthoLeft = -1;
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 300;
    camera.attachControl(scene, false);

    const box = MeshBuilder.CreateBox(
      "box",
      { size: 100, sideOrientation: Mesh.DOUBLESIDE },
      scene
    );

    Effect.ShadersStore.postprocessVertexShader = vertex;
    Effect.ShadersStore.postprocessFragmentShader = fragment;

    material = new ShaderMaterial(
      "shader",
      scene,
      { vertex: "postprocess", fragment: "postprocess" },
      {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "scale", "wave", "target"],
      }
    );

    const texture = {
      channel1: new Texture(options.channel1, scene, false, false),
      channel2: new Texture(options.channel2, scene, false, false),
    };

    material.setInt("mode", options.shaderMode);
    material.setInt("iterations", options.iterations);
    material.setInt("vIterations", options.vIterations);
    material.setFloat("speed", options.speed);
    material.setFloat("filterRed", options.filterRed);
    material.setFloat("filterGreen", options.filterGreen);
    material.setFloat("filterBlue", options.filterBlue);

    material.setTexture("channel1", texture.channel1, scene);
    material.setTexture("channel2", texture.channel2, scene);
    material.setColor3("target", Color3.FromHexString(COLORS.TARGET));
    material.setColor3("wave", Color3.FromHexString(COLORS.WAVE));

    material.setVector2("scale", new Vector2(options.scale, options.scale));

    box.material = material;
    box.rotation = new Vector3(Math.PI, 0, 0);
  };
  let time = 0;
  const onRender = (scene) => {
    time += scene.getEngine().getDeltaTime() / 1000;
    material.setFloat("time", time);
  };

  // Render Loop

  const updateFuncs = {
    loadImage: () => {
      document.getElementById("file-image").click();
    },
  };

  function changeImageTo(path, channel) {
    const image = new Texture(path, scene, false, false);
    material.setTexture(channel, image, scene);
  }

  function injectImage(evt) {
    const { files } = evt.target;
    const [f] = files;
    const reader = new FileReader();

    reader.onload = (() => (e) => {
      changeImageTo(e.target.result, "channel1");
    })(f);

    reader.readAsDataURL(f);
  }

  // Adds GUI stuff
  // const gui = super.gui();
  // gui.add(updateFuncs, "loadImage").name("Upload custom image");
  // gui
  //   .add(options, "channel1", imageList)
  //   .name("Image Channel 1")
  //   .onChange(() => {
  //     changeImageTo(options.channel1, "channel1");
  //   });
  // gui
  //   .add(options, "channel2", imageList)
  //   .name("Image Channel 2")
  //   .onChange(() => {
  //     changeImageTo(options.channel2, "channel2");
  //   });
  // gui
  //   .add(options, "shaderMode", modeList)
  //   .name("Shader mode")
  //   .onChange(() => {
  //     material.setInt("mode", options.shaderMode);
  //   });
  // gui
  //   .add(options, "speed")
  //   .name("Speed")
  //   .min(0.01)
  //   .max(2.0)
  //   .onChange(() => {
  //     material.setFloat("speed", options.speed.toFixed(2));
  //   });

  // const guiBlur = gui.addFolder("Blur Settings");

  // guiBlur
  //   .add(options, "iterations")
  //   .name("Horizontal Step")
  //   .step(1)
  //   .min(1)
  //   .max(5)
  //   .onChange(() => {
  //     material.setInt("iterations", options.iterations.toFixed(0));
  //   });

  // guiBlur
  //   .add(options, "vIterations")
  //   .name("Vertical Step")
  //   .step(1)
  //   .min(1)
  //   .max(5)
  //   .onChange(() => {
  //     material.setInt("vIterations", options.vIterations.toFixed(0));
  //   });
  // guiBlur.close();

  // const guiColor = gui.addFolder("Color Settings");
  // guiColor
  //   .add(options, "filterRed")
  //   .name("R")
  //   .min(0.01)
  //   .max(1.0)
  //   .onChange(() => {
  //     material.setFloat("filterRed", options.filterRed.toFixed(2));
  //   });
  // guiColor
  //   .add(options, "filterGreen")
  //   .name("G")
  //   .min(0.01)
  //   .max(1.0)
  //   .onChange(() => {
  //     material.setFloat("filterGreen", options.filterGreen.toFixed(2));
  //   });
  // guiColor
  //   .add(options, "filterBlue")
  //   .name("B")
  //   .min(0.01)
  //   .max(1.0)
  //   .onChange(() => {
  //     material.setFloat("filterBlue", options.filterBlue.toFixed(2));
  //   });
  // guiColor.close();

  return (
    <>
      <SceneComponent
        antialias
        onSceneReady={onSceneReady}
        onRender={onRender}
        id="my-canvas"
      />
    </>
  );
}
