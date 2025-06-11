import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from './theme';
import ScrollBox from "./Scrollbox";


export default function PitchControl() {
    const [currentPitch, setCurrentPitch] = useState<string>("");
    
    useEffect(() => {
      console.log("Current Pitch: ", currentPitch);
    }, [currentPitch]);

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