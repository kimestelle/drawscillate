import { useRef } from 'react';

export function MidiKeyboard({ clip }) {
  const audioContextRef = useRef(null);
  const stopRef = useRef(false);
  const currentOscillatorRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const wave = clip?.wave;
  const BASE_MIDI = 33;
  const TOTAL_KEYS = 75;
  const A1_MIDI = 33;
  const A1_FREQ = 55;

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
    gainNode.gain.setValueAtTime(1, context.currentTime);

    oscillator.start();
    currentOscillatorRef.current = oscillator;

    drawWaveform(wave, freq, 2);
  }

  function stopOscillator() {
    if (currentOscillatorRef.current) {
      currentOscillatorRef.current.stop();
      currentOscillatorRef.current.disconnect();
      currentOscillatorRef.current = null;
    }
    cancelAnimationFrame(animationRef.current);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleMouseDown(freq) {
    stopRef.current = false;
    startOscillator(freq);
  }

  function handleMouseUp() {
    stopRef.current = true;
    stopOscillator();
  }

  function drawWaveform(rawWave, frequency = 440, visualSpeedFactor = 1) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
  
    // normalize waveform 
    const min = Math.min(...rawWave);
    const max = Math.max(...rawWave);
    const mean = (min + max) / 2;
    const amplitude = Math.max(Math.abs(min - mean), Math.abs(max - mean)) || 1;
    const wave = rawWave.map(v => (v - mean) / amplitude);
  
    const waveLength = wave.length;
    const samplesPerSecond = audioContextRef.current.sampleRate;
    const samplesPerCycle = samplesPerSecond / frequency;
  
    let t = 0;
    const pixelsPerSecond = width / (samplesPerCycle / samplesPerSecond);
    const pixelsPerFrame = (pixelsPerSecond / 60) / visualSpeedFactor;
  
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
  
      for (let i = 0; i < width; i++) {
        const sampleIndex = Math.floor((i + t) % waveLength);
        const val = wave[sampleIndex] || 0;
        const y = height / 2 - val * (height / 2);
        ctx.lineTo(i, y);
      }
  
      ctx.stroke();
      t = (t + pixelsPerFrame) % waveLength;
      animationRef.current = requestAnimationFrame(draw);
    }
  
    draw();
  }
  

  const whiteNotes = [];
  const blackNotes = [];

  for (let i = BASE_MIDI; i < BASE_MIDI + TOTAL_KEYS; i++) {
    const note = getNoteName(i);
    const freq = midiToFreq(i);
    const isSharp = note.includes('#');
    const offset = i - BASE_MIDI;

    const key = (
      <button
        key={i}
        onMouseDown={() => handleMouseDown(freq)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute ${isSharp ? 'bg-black z-10 w-4 h-24' : 'bg-white w-8 h-32'} border border-black`}
        style={{ left: `${isSharp ? (offset - 0.5) * 16 : offset * 16}px` }}
        title={note}
      />
    );

    if (isSharp) blackNotes.push(key);
    else whiteNotes.push(key);
  }

  return (
    <div className="relative flex flex-row w-full h-32 overflow-x-scroll overflow-y-hidden">
      <canvas
        ref={canvasRef}
        className="absolute w-full h-[50%] top-0 left-0 z-20 pointer-events-none"
        width={TOTAL_KEYS * 16}
      />
      <div className="relative w-5 h-full z-0">{whiteNotes}</div>
      <div className="absolute top-0 w-5 left-0 z-10">{blackNotes}</div>
    </div>
  );
}
