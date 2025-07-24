export function pointsToWave(  
    points: { x: number; y: number }[],
    canvasWidth: number,
    canvasHeight: number,
    samplesPerCycle: number) {

    const wave = new Float32Array(samplesPerCycle);
    wave.fill(0);
      
    if (points.length === 0) return wave;
      
    if (points[0].x > 0) {
        points.unshift({ x: 0, y: canvasHeight / 2 }); // or pick the last known value
    }
    if (points[points.length - 1].x < canvasWidth) {
    points.push({ x: canvasWidth, y: canvasHeight / 2 });
    }
    // Interpolate points to evenly spaced samples over samplesPerCycle
    // First, scale points x to samplesPerCycle domain
    const scaledPoints = points.map(p => ({
      x: (p.x / canvasWidth) * samplesPerCycle,
      y: p.y,
    }));
      
    for (let i = 0; i < samplesPerCycle; i++) {
      // Find two points around i
      let p0, p1;
      for (let j = 0; j < scaledPoints.length - 1; j++) {
        if (scaledPoints[j].x <= i && scaledPoints[j+1].x >= i) {
          p0 = scaledPoints[j];
          p1 = scaledPoints[j+1];
          break;
        }
      }
      if (!p0 || !p1) {
        wave[i] = 0; // outside drawn range
      } else {
        const t = (i - p0.x) / (p1.x - p0.x);
        const y = p0.y + t * (p1.y - p0.y);
        wave[i] = 1 - 2 * (y / canvasHeight);
      }
    }
      
    return wave;
  }

export function float32ToWav(float32Array: Float32Array, volume: number, sampleRate: number, repeatCountInput: number ) {
console.log("float32Array:", float32Array.slice(0, 10));

    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const originalLength = float32Array.length;
    const numSamples = originalLength * repeatCountInput;
    
    const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
    const view = new DataView(buffer);
    
    let offset = 0;
    const writeString = (str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset++, str.charCodeAt(i));
        }
    };
    console.log("Buffer size:", buffer.byteLength);
    writeString('RIFF');
    view.setUint32(offset, 36 + numSamples * bytesPerSample, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * numChannels * bytesPerSample, true); offset += 4;
    view.setUint16(offset, numChannels * bytesPerSample, true); offset += 2;
    view.setUint16(offset, bitsPerSample, true); offset += 2;
    writeString('data');
    view.setUint32(offset, numSamples * bytesPerSample, true); offset += 4;

    for (let r = 0; r < repeatCountInput; r++) {
        for (let i = 0; i < originalLength; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, float32Array[i] * volume));
            s = s < 0 ? s * 0x8000 : s * 0x7FFF;
            view.setInt16(offset, s, true);
        }
    }
    
    console.log("Final offset:", offset);
console.log("Expected length:", 44 + numSamples * bytesPerSample);
console.log("WAV header bytes:", new Uint8Array(buffer).slice(0, 44));


    return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}
