import React, { useRef, useState, useEffect } from 'react';
import '../styles/drawscillator.css';

export function Drawscillator() {
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
    
    // Converts points array to waveform array
    function pointsToWave(points, canvasHeight) {
        const wave = new Float32Array(canvasRef.current.width);
        wave.fill(0); 

        points.forEach(({ x, y }) => {
            const amp = 1 - 2 * (y / canvasHeight);
            wave[Math.floor(x)] = amp;
        });   
        
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

    function float32ToWav(float32Array, sampleRate = 44100) {
        const numChannels = 1;
        const bitsPerSample = 16;
        const bytesPerSample = bitsPerSample / 8;
        const numSamples = float32Array.length;
      
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
      
        for (let i = 0; i < numSamples; i++, offset += 2) {
          let s = Math.max(-1, Math.min(1, float32Array[i]));
          s = s < 0 ? s * 0x8000 : s * 0x7FFF;
          view.setInt16(offset, s, true);
        }
      
        return new Blob([buffer], { type: 'audio/wav' });
    }
      
    
    return (
        <div className="drawscillator-container">
            <div className="drawscillator-subcontainer">
                <canvas ref={canvasRef} className="relative w-[80svw] aspect-[3/1] border border-black" width={400} height={200} />
                
                <div className="drawscillator-controls">
                    <button className="drawscillator-button" onClick={handleClear}>
                        Clear
                    </button>
                    <button className="drawscillator-button" onClick={handleSubmit}>
                        Submit
                    </button>
                    {/* <button className="drawscillator-button" onClick={handleAudio}>
                        Play Sound
                    </button> */}
                </div>
                {selectedClip !== null && (
                <div className="drawscillator-selected-clip">
                    <h3>Selected Clip</h3>
                    <img src={clips[selectedClip].image} alt={`Waveform ${selectedClip}`} className="wave-preview" />
                    <audio controls src={clips[selectedClip].audioUrl} autoPlay loop></audio>
                </div>
            )}
            </div>

            <div className="audio-clips-container">
                {clips.map((clip, i) => (
                    <div key={i} className="drawscillator-clip" onClick={() => setSelectedClip(i)}>
                        <img src={clip.image} alt={`Waveform ${i}`} className="wave-preview" />
                    </div>
                ))}
            </div>  
      </div>
    );
}
