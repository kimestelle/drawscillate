  export function createPitchedWave(waveData: Float32Array, targetFreq: number, baseFreq: number) {
    if (!waveData || waveData.length < 2) return new Float32Array(0);
  
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

    //fast fourier transform
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
  
    const scale = targetFreq / baseFreq;
    const shiftedReal = new Float32Array(resampledSize);
    const shiftedImag = new Float32Array(resampledSize);


    for (let k = 0; k < resampledSize; k++) {
        const srcIndex = k / scale;
        const i0 = Math.floor(srcIndex);
        const i1 = Math.min(i0 + 1, resampledSize - 1);
        const frac = srcIndex - i0;

        if (i0 >= 0 && i0 < resampledSize) {
        shiftedReal[k] = real[i0] * (1 - frac) + real[i1] * frac;
        shiftedImag[k] = imag[i0] * (1 - frac) + imag[i1] * frac;
        } else {
        shiftedReal[k] = 0;
        shiftedImag[k] = 0;
        }
    }

    //inverse fourier transform
    const output = new Float32Array(resampledSize);
    for (let n = 0; n < resampledSize; n++) {
        let sum = 0;
        for (let k = 0; k < resampledSize; k++) {
        const phase = (2 * Math.PI * k * n) / resampledSize;
        sum += shiftedReal[k] * Math.cos(phase) - shiftedImag[k] * Math.sin(phase);
        }
        output[n] = sum;
    }

    let maxMag = 0;
    for (let i = 0; i < resampledSize; i++) maxMag = Math.max(maxMag, Math.abs(output[i]));
    if (maxMag > 0) {
        const norm = 0.99 / maxMag;
        for (let i = 0; i < resampledSize; i++) output[i] *= norm;
    }

    return output;
  }
