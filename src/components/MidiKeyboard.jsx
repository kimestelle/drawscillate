import { useRef, useEffect } from 'react';

export function MidiKeyboard({ clip, volume = 1 }) {
  const audioContextRef = useRef(null);
  const stopRef = useRef(false);
  const currentOscillatorRef = useRef(null);

  // const canvasRef = useRef(null);
  // const animationRef = useRef(null);

  const wave = clip?.wave;
  const BASE_MIDI = 33;
  const TOTAL_KEYS = 75;
  const A1_MIDI = 33;
  const A1_FREQ = 55;

  useEffect(() => {
    const keys = document.querySelectorAll('.white-key, .black-key');
    keys.forEach((key) => {
      key.addEventListener(
        'touchstart',
        (e) => e.preventDefault(),
        { passive: false }
      );
    });
  
    return () => {
      keys.forEach((key) => {
        key.removeEventListener(
          'touchstart',
          (e) => e.preventDefault(),
          { passive: false }
        );
      });
    };
  }, []);

  function midiToFreq(midi) {
    return A1_FREQ * Math.pow(2, (midi - A1_MIDI) / 12);
  }

  function getNoteName(midi) {
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return names[midi % 12];
  }

  function createPeriodicWave(context, waveData) {
    if (waveData.length < 2) return null;
  
    const resampledSize = 512;
    const real = new Float32Array(resampledSize);
    const imag = new Float32Array(resampledSize);

    const resampled = new Float32Array(resampledSize);
    for (let i = 0; i < resampledSize; i++) {
      const t = (i / resampledSize) * (waveData.length - 1);
      const i0 = Math.floor(t);
      const i1 = Math.min(i0 + 1, waveData.length - 1);
      const frac = t - i0;
      resampled[i] = waveData[i0] * (1 - frac) + waveData[i1] * frac;
    }

    for (let k = 0; k < resampledSize; k++) {
      let sumRe = 0, sumIm = 0;
      for (let n = 0; n < resampledSize; n++) {
        const phase = (2 * Math.PI * k * n) / resampledSize;
        sumRe += resampled[n] * Math.cos(phase);
        sumIm -= resampled[n] * Math.sin(phase);
      }
      real[k] = sumRe / resampledSize;
      imag[k] = sumIm / resampledSize;
    }
  
    return context.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function startOscillator(freq) {
    if (!wave || wave.length < 2) return;

    const context = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = context;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    const periodicWave = createPeriodicWave(context, wave);
    if (!periodicWave) return;

    oscillator.setPeriodicWave(periodicWave);
    oscillator.frequency.setValueAtTime(freq, context.currentTime);

    oscillator.connect(gainNode).connect(context.destination);
    gainNode.gain.setValueAtTime(volume, context.currentTime); 

    oscillator.start();
    currentOscillatorRef.current = oscillator;

    // drawWaveform(wave, freq, 2);
  }

  function stopOscillator() {
    if (currentOscillatorRef.current) {
      currentOscillatorRef.current.stop();
      currentOscillatorRef.current.disconnect();
      currentOscillatorRef.current = null;
    }
    // cancelAnimationFrame(animationRef.current);
    // const canvas = canvasRef.current;
    // const ctx = canvas.getContext('2d');
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleMouseDown(freq) {
    stopRef.current = false;
    startOscillator(freq);
  }

  function handleMouseUp() {
    stopRef.current = true;
    stopOscillator();
  }

  // function drawWaveform(rawWave, frequency = 440, visualSpeedFactor = 1) {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
  //   if (!canvas || !ctx) return;
  //   const width = canvas.width;
  //   const height = canvas.height;
  
  //   // normalize waveform 
  //   const min = Math.min(...rawWave);
  //   const max = Math.max(...rawWave);
  //   const mean = (min + max) / 2;
  //   const amplitude = Math.max(Math.abs(min - mean), Math.abs(max - mean)) || 1;
  //   const wave = rawWave.map(v => (v - mean) / amplitude);
  
  //   const waveLength = wave.length;
  //   const samplesPerSecond = audioContextRef.current.sampleRate;
  //   const samplesPerCycle = samplesPerSecond / frequency;
  
  //   let t = 0;
  //   const pixelsPerSecond = width / (samplesPerCycle / samplesPerSecond);
  //   const pixelsPerFrame = (pixelsPerSecond / 60) / visualSpeedFactor;
  
  //   function draw() {
  //     ctx.clearRect(0, 0, width, height);
  //     ctx.beginPath();
  //     ctx.strokeStyle = '#38bdf8';
  
  //     for (let i = 0; i < width; i++) {
  //       const sampleIndex = Math.floor((i + t) % waveLength);
  //       const val = wave[sampleIndex] || 0;
  //       const y = height / 2 - val * (height / 2);
  //       ctx.lineTo(i, y);
  //     }
  
  //     ctx.stroke();
  //     t = (t + pixelsPerFrame) % waveLength;
  //     animationRef.current = requestAnimationFrame(draw);
  //   }
  
  //   draw();
  // }
  

  const whiteNotes = [];
  const blackNotes = [];

  let whiteIndex = 0;
  for (let i = BASE_MIDI; i < BASE_MIDI + TOTAL_KEYS; i++) {
    const note = getNoteName(i);
    const isSharp = note.includes('#');
    const freq = midiToFreq(i);
  
    if (!isSharp) {
      const key = (
        <button
          key={i}
          onMouseDown={() => handleMouseDown(freq)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => handleMouseDown(freq)}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}


          className="white-key absolute select-none bg-white hover:bg-neutral-200 w-[31px] h-32 shadow-inner"
          style={{ left: `${whiteIndex * 32}px` }}
          title={note}
        />
      );
      whiteNotes.push(key);
      whiteIndex++;
    }
  }

  whiteIndex = 0;
  for (let i = BASE_MIDI; i < BASE_MIDI + TOTAL_KEYS; i++) {
    const note = getNoteName(i);
    const isSharp = note.includes('#');
    const freq = midiToFreq(i);
  
    if (!isSharp) {
      whiteIndex++;
      continue;
    }
  
    const prevNote = getNoteName(i - 1);
    if (['E', 'B'].includes(prevNote)) continue; // no black keys after E/B
  
    const key = (
      <button
        key={i}
        onMouseDown={() => handleMouseDown(freq)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="black-key absolute select-none bg-black hover:bg-neutral-800 w-6 h-20 top-[9px] z-10 border border-black"
        style={{ left: `${(whiteIndex - 1) * 32 + 15.5}px` }} 
        title={note}
      />
    );
    blackNotes.push(key);
  }
  

  return (
    <div className="relative flex flex-row w-full bg-neutral-200 shadow-inner rounded-md h-38 p-3 shrink-0 overflow-x-scroll">
      {/* <canvas
        ref={canvasRef}
        className="absolute w-full h-[50%] top-0 left-0 z-20 pointer-events-none"
      /> */}
      <div className="relative w-full h-full z-0">{whiteNotes}</div>
      <div className="absolute top-0 w-full left-4 z-10">{blackNotes}</div>
    </div>
  );
}
