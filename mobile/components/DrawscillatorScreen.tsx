import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import CanvasPlayer from "./CanvasPlayer";
import TempoControls from "./TempoControls";
import PitchControl from "./PitchControl";
import VolumeControl from "./VolumeControl";
import { scaleHeight, scaleWidth } from "./theme";

export default function App() {
  const [pitchFrequency, setPitchFrequency] = useState(0);
  const [volume, setVolume] = useState(1);
  // const [tempo, setTempo] = useState(128);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDotIndex, setCurrentDotIndex] = useState(0);

  const [bpm, setBpm] = useState(128);
  const [debouncedBpm, setDebouncedBpm] = useState(bpm);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBpm(bpm), 100);
    return () => clearTimeout(t);
  }, [bpm]);

  return (
    <View style={styles.container }>
      <StatusBar style="auto" />

      <View style={{ transform: [{ translateY: scaleHeight(0) }] }}>
        <View style={{ transform: [{ translateY: scaleHeight(10) }] }}>
            <CanvasPlayer
              pitchFrequency={pitchFrequency} 
              volume={volume}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              bpm={debouncedBpm}
              setCurrentDotIndex={setCurrentDotIndex}
            />
        </View>
        
        <View style={styles.controls} >
            <TempoControls
              isPlaying={isPlaying}
              onTempoChange={setBpm}
              currentDotIndex={currentDotIndex}
            />

            <View style={styles.pitch_volume_controls}>
                <View style={{ transform: [{ translateY: scaleHeight(54) }] }}>
                    <PitchControl setPitchFrequency={setPitchFrequency}/>
                </View>
                
                <View style={{ 
                    width: scaleWidth(70), 
                    height: scaleHeight(100), 
                    borderWidth: 1, 
                    transform: [{ translateY: scaleHeight(142) }, { translateX: scaleWidth(20) }] }}> 
                    {/* TODO: insert drawing here */}
                </View>
                <VolumeControl setVolume={setVolume} />
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // so absolute redrawIcon is positioned relative to this
    gap: 10,
  },
  pitch_volume_controls: {
    // borderWidth: 1,
    // borderColor: "black",
    flexDirection: "row",
    gap: scaleWidth(20),
    justifyContent: "center"
  },
  controls: {
    
  }
});
