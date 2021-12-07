/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { BiPlayCircle } from 'react-icons/bi';
import { useTweaks, makeButton } from 'use-tweaks';
import Channel from './Channel';
import Ground from './Ground';
import Audio from '../../../../libs/Utils/audio';

import './styles.scss';

export default function AudioVisualizer() {
  const trackList = {
    'NIИ Ghosts 14': 'nin-ghosts-14.mp3',
    'NIИ Ghosts 23': 'nin-ghosts-23.mp3',
    'NIИ Ghosts 24': 'nin-ghosts-24.mp3',
    'NIИ Ghosts 34': 'nin-ghosts-34.mp3',
  };

  const playerRef = useRef();
  const [playing, setPlaying] = useState(false);
  // const [currentTrack, setCurrentTrack] = useState();
  const [audioSource, setAudioSource] = useState(false);

  // const BLOOM = {
  //   ANIMATE: true,
  //   EXP: 1,
  //   STR: 0.3,
  //   THRES: 0,
  //   RAD: 0.5,
  // };

  const handleOnPlay = () => {
    setPlaying(true);
    playerRef.current.muted = false;

    if (!audioSource) {
      setAudioSource(Audio.Analyzer(playerRef.current));
    }
  };

  const handleOnEnded = () => {

  };

  // const bloomPass = new UnrealBloomPass(
  //   new THREE.Vector2(window.innerWidth, window.innerHeight),
  //   1.5,
  //   0.4,
  //   0.85,
  // );

  // bloomPass.threshold = BLOOM.THRES;
  // bloomPass.strength = BLOOM.STR;
  // bloomPass.radius = BLOOM.RAD;

  // AUDIO = audioSource.sample();
  // const channel = AUDIO.streamData[i];
  // const attrs = {
  //   scale: (channel + 0.1) / 3,
  //   squeeze: (1 / 255) * (255 - channel / 2),
  //   color: new THREE.Color(0x0).setHSL((0.27 / 128) * (255 - channel), 1, 0.5),
  // };

  // cubes[i].scale.y = attrs.scale;
  // cubes[i].position.y = attrs.scale / 2;
  // cubes[i].scale.x = attrs.squeeze;
  // cubes[i].scale.z = attrs.squeeze;
  // cubes[i].material.opacity = (1 / 255) * channel;

  // cubesWireframe[i].scale.y = attrs.scale;
  // cubesWireframe[i].position.y = attrs.scale / 2;
  // cubesWireframe[i].scale.x = attrs.squeeze;
  // cubesWireframe[i].scale.z = attrs.squeeze;

  // cubesWireframe[i].material.color = attrs.color;
  // cubes[i].material.color = attrs.color;

  // camera.position.y = 65 + 120 * AUDIO.mental;

  // bloomPass.strength = AUDIO.mental / 3 + 0.2;

  const cubes = Array(64).fill();

  const source = './assets/audio/nin-ghosts-23.mp3';
  // const { source } = useTweaks({
  //   source: {
  //     label: 'Audio source',
  //     options: trackList,
  //   },
  //   ...makeButton('Play', () => { player.play(); }),
  //   ...makeButton('Stop', () => { player.pause(); }),
  // });

  return (
    <>
      <Canvas camera={{ fov: 75, position: [-5, 12, -5] }}>
        <color attach="background" args={[0x000000]} />
        <ambientLight intensity={1} color={0xffffff} />
        {
          cubes.map((data, i) => {
            // set x and y position in a grid of 6 by 6 with a distance of 3
            // between each cube
            const x = ((i * 2) % (64 / 6));
            const z = ((i * 2) / (64 / 6));

            const position = [x, 0, z];
            return (
              <Channel key={i} index={i} position={position} source={audioSource} />
            );
          })
        }
        <Ground channel={audioSource} />
        <fogExp2 args={[0x111111, 5, 20]} />
      </Canvas>

      <audio
        src={source}
        ref={playerRef}
        autoPlay
        muted
        onPlay={handleOnPlay}
        onEnded={handleOnEnded}
        className="player"
      />

      {!playing && (
        <div className="player-controls--container">
          <button
            type="button"
            onClick={() => { playerRef.current.play(); }}
            className="player-controls-button"
          >
            <BiPlayCircle size={48} />
          </button>
        </div>
      )}
    </>
  );
}
