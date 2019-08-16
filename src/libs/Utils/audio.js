const Analyzer = (player) => {
  let volume = 0;
  let volumeLow = 0;
  let volumeHi = 0;
  const streamData = new Uint8Array(256);

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const source = audioCtx.createMediaElementSource(player);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const sampleAudioStream = () => {
    analyser.getByteFrequencyData(streamData);

    let total = 0;
    for (let i = 0; i < 64; i += 1) {
      total += streamData[i];
    }
    volume = total;

    let totalLow = 0;
    for (let i = 0; i < 31; i += 1) {
      totalLow += streamData[i];
    }
    volumeLow = totalLow;

    let totalHi = 0;
    for (let i = 31; i < 64; i += 1) {
      totalHi += streamData[i];
    }
    volumeHi = totalHi;

    return {
      volume,
      volumeLow,
      volumeHi,
      streamData,
    };
  };

  return {
    sample: sampleAudioStream,
  };
};

export default {
  Analyzer,
};
