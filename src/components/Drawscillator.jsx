import React, { useRef, useState, useEffect } from 'react';
import { MidiKeyboard } from './MidiKeyboard';
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

        ctx.lineWidth = 3;
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
        setClips((prev) => {
            const updated = [...prev, { image, wave, audioUrl }];
            return updated;
        });
        
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
        <div className="w-full h-full flex flex-col items-center p-5 bg-white">
            <div className='relative felt-bg w-full h-full overflow-hidden max-w-[60rem] flex flex-col items-center justify-between rounded-xl shadow-lg gap-2 p-2 md:p-10 md:px-24'>
                <div className='w-full flex flex-row items-start md:mb-10'>
                <h1 className='text-[2rem] md:text-[3rem]'>DRAWscillator</h1>
                <div className='w-full h-[85%] border-b border-white'></div>
                </div>
                <div className='w-full h-min flex flex-col sm:flex-row items-center justify-center gap-5'>
                    <canvas ref={canvasRef} className="w-full aspect-[3/1] border border-black" width={400} height={200} />

                    <div className='w-full h-full flex flex-col items-center justify-center gap-2'>
                    <div className="w-full h-[9svh] overflow-x-scroll flex flex-row items-center justify-center gap-5 bg-neutral-200 shadow-inner rounded-sm p-2">
                    {clips.map((clip, i) => (
                        <div key={i} className="relative h-full shrink-0" onClick={() => setSelectedClip(i)}>
                            <img src={clip.image} alt={`Waveform ${i}`} className="w-full h-full border border-blacks" />
                            <a
                                href={clip.audioUrl}
                                download={`drawscillator_clip_${i}.wav`}
                                className="absolute top-0 right-0 text-white text-[1.5svw] bg-blue-600 hover:bg-blue-700 p-[0.5svw] rounded"
                            >
                            ⬇
                        </a>
                        {selectedClip === i && (
                            <>
                            <img src={clip.image} alt={`Selected Waveform ${i}`} className="absolute top-0 left-0 w-full h-full border-2 border-yellow-500" />
                            <audio controls src={clips[selectedClip].audioUrl} hidden autoPlay></audio>
                            </>
                        )}
                        </div>
                    ))}
                </div> 
                <div className="w-full h-min flex flex-row gap-[1svw]">
                        <button className="rounded-md bg-black p-[0.2svw] px-2" onClick={handleClear}>
                            Clear
                        </button>
                        <button className="rounded-md bg-black p-[0.2svw] px-2"onClick={handleSubmit}>
                            Submit
                        </button>
                </div>
                </div>
            </div>
            <div id="submitted-clip-and-keyboard" className='w-full h-full flex flex-row items-center justify-center gap-[2svw]'>
                <div className='w-[30svw] bg-neutral-200 rounded-md p-[0.5svw] pb-[0.2svw] h-full flex flex-col'>
                {selectedClip !== null && (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img src={clips[selectedClip].image} alt={`Selected Waveform ${selectedClip}`} className="w-full border border-black" />
                        <audio className='w-full' controls src={clips[selectedClip].audioUrl} loop></audio>
                    </div>
                )}
                </div>
                <div className='w-full h-full flex flex-col items-center justify-center'>
                    <p className='text-[2svw]'>controls here like frequency or volume</p>
                </div>
            </div>
            <MidiKeyboard clip={clips[selectedClip]} />
        </div>
      </div>
    );
}
