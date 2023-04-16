import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { BiPlayCircle } from "react-icons/bi";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { degToRad } from "three/src/math/MathUtils";

import Channel from "./Channel";
import Ground from "./Ground";
import Audio from "../../../../libs/Utils/audio";

import "./styles.scss";
import { useControls, button } from "leva";

export default function AudioVisualizer() {
  const trackList = {
    "NIИ Ghosts 14": "nin-ghosts-14.mp3",
    "NIИ Ghosts 23": "nin-ghosts-23.mp3",
    "NIИ Ghosts 24": "nin-ghosts-24.mp3",
    "NIИ Ghosts 34": "nin-ghosts-34.mp3",
  };

  const playerRef = useRef();
  const bloomRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState(false);

  const handleOnPlay = () => {
    setPlaying(true);
    playerRef.current.muted = false;

    if (!audioSource) {
      setAudioSource(Audio.Analyzer(playerRef.current));
    }
  };

  const cubes = Array(64).fill();

  const { source = "nin-ghosts-23.mp3" } = useControls({
    source: {
      options: trackList,
    },
    play: button(() => {
      playerRef.current.play();
    }),
    stop: button(() => {
      playerRef.current.pause();
    }),
  });

  function RotateCamera() {
    // This one makes the camera move in and out
    useFrame(({ clock, camera }) => {
      const c = camera;
      c.position.x = Math.cos(clock.getElapsedTime() / 4) * 8 - 4;
      c.position.z = Math.sin(clock.getElapsedTime() / 4) * 8 - 4;
      if (audioSource) {
        const { mental } = audioSource.sample();
        c.position.y = 2 + 2 * mental;
      } else {
        c.position.y = 2;
      }
      c.lookAt(-4, 0, -4);
    });
    return null;
  }

  function MentalBloom() {
    // This one makes the bloom effect
    useFrame(({ clock, gl }) => {
      if (audioSource) {
        const { mental } = audioSource.sample();
        bloomRef.current.intensity = mental + 0.2;
      }
    });
    return null;
  }

  return (
    <>
      <Canvas camera={{ fov: 90, position: [-10, 2, -10] }}>
        <color attach="background" args={[0x050505]} />
        <ambientLight intensity={1} color={0xffffff} />
        {cubes.map((data, i) => {
          // set x and z position in a 8*8 grid
          // with a padding of 2 units
          const x = (i % 8) * 1.15 - 8;
          const z = Math.floor(i / 8) * 1.15 - 8;

          const position = [x, 0, z];
          return (
            <Channel
              key={i}
              index={i}
              position={position}
              source={audioSource}
            />
          );
        })}
        <Ground
          position={[0, -2, 0]}
          rotation={[degToRad(-90), 0, 0]}
          source={audioSource}
        />
        <Ground
          position={[0, 5, 0]}
          rotation={[degToRad(90), 0, 0]}
          source={audioSource}
        />
        <fogExp2 args={[0x050505, 5, 20]} />
        <RotateCamera />
        <MentalBloom />
        <EffectComposer multisampling={0}>
          <Bloom
            ref={bloomRef}
            intensity={1}
            kernelSize={2}
            luminanceThreshold={0}
            luminanceSmoothing={1}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      <audio
        src={`/assets/audio/${source}`}
        ref={playerRef}
        autoPlay
        muted
        loop
        onPlay={handleOnPlay}
        className="player"
      />

      {!playing && (
        <div className="player-controls--container">
          <button
            type="button"
            onClick={() => {
              playerRef.current.play();
            }}
            className="player-controls-button"
          >
            <span>
              <BiPlayCircle size={48} />
            </span>
          </button>
        </div>
      )}
    </>
  );
}
