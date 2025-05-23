import React, { useRef, useState, useEffect } from 'react';
import '../styles/drawscillator.css';

export function Drawscillator() {

    const sampleRateGlobal = 44100;
    const waveLength = 341;

    const canvasRef = useRef(null);
    const pointsRef = useRef([]);
    const drawingRef = useRef(false);
    const lastXRef = useRef(0);
    const lastYRef = useRef(0);

    const [clips, setClips] = useState([]);
    const [selectedClip, setSelectedClip] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d'); 
        
        ctx.fillStyle = 'none';

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'lightgray';
        ctx.lineCap = 'round';    

        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke(); 

        ctx.strokeStyle = 'black';    

        function getMousePos(e, canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height; 
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        } 

        function onMouseDown(e) {
            const pos = getMousePos(e, canvas);

            if (pos.x > 0) {
                if ((pointsRef.current.length === 0)) {
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height / 2);
                    ctx.lineTo(pos.x, pos.y);
                    ctx.stroke();
                } else if (pos.x > lastXRef.current) {
                    ctx.beginPath();
                    ctx.moveTo(lastXRef.current, lastYRef.current);
                    ctx.lineTo(pos.x, pos.y);
                    ctx.stroke();
                }
            }

            if (pos.x == canvas.width) {
                handleSubmit();
                return;
            }
            
            drawingRef.current = true;
            
            if (pos.x <= lastXRef.current) {
                return;
            }
            
            lastXRef.current = pos.x;
            lastYRef.current = pos.y;
            
            pointsRef.current = [{ x: pos.x, y: pos.y }];
        } 

        function onMouseMove(e) {
            if (!drawingRef.current) return;    
            const pos = getMousePos(e, canvas); 
            if (pos.x >= lastXRef.current) {
                ctx.beginPath();
                ctx.moveTo(lastXRef.current, lastYRef.current);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke(); 
                lastXRef.current = pos.x;
                lastYRef.current = pos.y;
                pointsRef.current.push({ x: pos.x, y: pos.y });
            }
        } 

        function onMouseUp() {
            drawingRef.current = false;
        } 
        
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseout', onMouseUp); 
          
        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseout', onMouseUp);
        };
    }, []); 
    
    function pointsToWave(points, canvasHeight) {
        const wave = new Float32Array(waveLength);
        wave.fill(0);
      
        if (points.length === 0) return wave;
      
        // Interpolate points to evenly spaced samples over waveLength
        // First, scale points x to waveLength domain
        const scaledPoints = points.map(p => ({
          x: (p.x / canvasRef.current.width) * waveLength,
          y: p.y,
        }));
      
        for (let i = 0; i < waveLength; i++) {
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

    // Handle submit button click
    function handleSubmit() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
          
        if (pointsRef.current.length === 0) {
            pointsRef.current.push({ x: 0, y: canvas.height / 2 });
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            pointsRef.current.push({ x: canvas.width, y: canvas.height / 2 });
        } else if (lastXRef.current != canvas.width) {
            pointsRef.current.push({ x: canvas.width, y: canvas.height / 2 });
            ctx.beginPath();
            ctx.moveTo(lastXRef.current, lastYRef.current);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        }
        
        if (pointsRef.current.length === 0) {
            alert('Please draw something before submitting!');
            return;
        } 
        
        // Generate wave and image
        const wave = pointsToWave(pointsRef.current, canvas.height);
        const image = canvas.toDataURL();
        const audioBlob = float32ToWav(wave);        // 🔊 WAV blob
        const audioUrl = URL.createObjectURL(audioBlob);

        // Add to clips list
        setClips((prev) => [...prev, { image: image, wave: wave, audioUrl: audioUrl }]); 
        
        // Clear drawing data and canvas for next draw
        pointsRef.current = [];
        lastXRef.current = 0;
        lastYRef.current = 0; 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // Redraw the baseline line
        ctx.strokeStyle = 'lightgray';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke(); 
        ctx.strokeStyle = 'black';
        
        localStorage.setItem("image", image);
    }   

    // Clear canvas and reset drawing state
    function handleClear() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');  

        pointsRef.current = [];
        lastXRef.current = 0;
        lastYRef.current = 0;
        drawingRef.current = false;   

        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        
        ctx.strokeStyle = 'lightgray';
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke(); 
        
        ctx.strokeStyle = 'black';
    }

    function float32ToWav(float32Array, sampleRate = 44100, repeatCount = 30) {
        sampleRate = sampleRateGlobal
        const numChannels = 1;
        const bitsPerSample = 16;
        const bytesPerSample = bitsPerSample / 8;
        const originalLength = float32Array.length;
        const numSamples = originalLength * repeatCount;
    
        const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
        const view = new DataView(buffer);
    
        let offset = 0;
        const writeString = (str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset++, str.charCodeAt(i));
            }
        };
    
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
    
        for (let r = 0; r < repeatCount; r++) {
            for (let i = 0; i < originalLength; i++, offset += 2) {
                let s = Math.max(-1, Math.min(1, float32Array[i]));
                s = s < 0 ? s * 0x8000 : s * 0x7FFF;
                view.setInt16(offset, s, true);
            }
        }
    
        return new Blob([buffer], { type: 'audio/wav' });
    }
    
    
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-start overflow-y-scroll gap-5 bg-gray-200">
            <h1>DRAWscillator</h1>
            <canvas ref={canvasRef} className="w-[80svw] aspect-[3/1] border border-black" width={400} height={200} />
            <div className="flex flex-row gap-5">
                    <button className="drawscillator-button" onClick={handleClear}>
                        Clear
                    </button>
                    <button className="drawscillator-button" onClick={handleSubmit}>
                        Submit
                    </button>
                    {/* <button className="drawscillator-button" onClick={handleAudio}>
                        Play Sound a lot
                    </button> */}
                </div>

            <div className="w-full  flex flex-row items-center justify-center gap-5">
                {selectedClip !== null && (
                <div className="drawscillator-selected-clip">
                    <h3>Selected Clip</h3>
                    <img src={clips[selectedClip].image} alt={`Waveform ${selectedClip}`} className="wave-preview" />
                    <audio controls src={clips[selectedClip].audioUrl} autoPlay loop></audio>
                </div>
            )}
            <div className="h-full overflow-y-scroll flex flex-col items-center justify-center gap-5">
                {clips.map((clip, i) => (
                    <div key={i} className="drawscillator-clip relative" onClick={() => setSelectedClip(i)}>
                        <img src={clip.image} alt={`Waveform ${i}`} className="wave-preview" />
                        <a
                            href={clip.audioUrl}
                            download={`drawscillator_clip_${i}.wav`}
                            className="absolute top-0 right-0 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                        >
                        ⬇
                      </a>
                    </div>
                ))}
            </div>  
            </div>
      </div>
    );
}
