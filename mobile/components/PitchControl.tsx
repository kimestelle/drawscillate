import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import ScrollBox from "./Scrollbox";

type PitchControlProps = {
  setPitchFrequency: (frequency: number) => void;
};
export default function PitchControl({ setPitchFrequency }: PitchControlProps) {
    const [currentPitch, setCurrentPitch] = useState<string>("");

    const pitchToFreq = (pitch: string): number => {
        //parse pitch string to note and octave
        const note = pitch.slice(0, -1);
        const octave = parseInt(pitch.slice(-1), 10);
        const noteFrequencies: { [key: string]: number } = {
            "C": 261.63,
            "C#": 277.18,
            "D": 293.66,
            "D#": 311.13,
            "E": 329.63,
            "F": 349.23,
            "F#": 369.99,
            "G": 392.00,
            "G#": 415.30,
            "A": 440.00,
            "A#": 466.16,
            "B": 493.88
        };
        //account for octave
        const baseFrequency = noteFrequencies[note];
        if (!baseFrequency) return 440;
        return baseFrequency * Math.pow(2, octave - 4);
    };
    
    useEffect(() => {
      console.log("Current Pitch: ", currentPitch);
      if (currentPitch) {
        const frequency = pitchToFreq(currentPitch);
        setPitchFrequency(frequency);
      }
    }, [currentPitch, setPitchFrequency]);

    return (
        <View style={styles.pitch_control}>
            <ScrollBox label={"PITCH"} initialValue={"C4"} onValueChange={(val) => setCurrentPitch(val.toString())} />
        </View>
    );
}

const styles = StyleSheet.create({
  pitch_control: {
    
  }
});