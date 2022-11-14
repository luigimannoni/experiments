const Analyzer = (player) => {
  let volume = 0;
  let volumeLow = 0;
  let volumeHi = 0;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let analyser = null;
  let source = null;
  const streamData = new Uint8Array(256);

  try {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('AudioContext is not available', e);
    return false;
  }

  const sampleAudioStream = () => {
    if (!analyser) {
      return false;
    }

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

    const mental = Math.min(
      Math.max(Math.tan(volumeHi / 6500) * 0.5),
      2,
    ) || 0;

    return {
      volume,
      volumeLow,
      volumeHi,
      mental,
      streamData,
    };
  };

  return {
    sample: sampleAudioStream,
  };
};

const Audio = {
  Analyzer,
};

export default Audio;
