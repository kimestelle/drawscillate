import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";

import CanvasPlayer from "./CanvasPlayer";
import TempoControls from "./TempoControls";
import PitchControl from "./PitchControl";
import VolumeControl from "./VolumeControl";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <CanvasPlayer />
      <TempoControls />
      
      <View style={styles.pitch_volume_controls}>
        <PitchControl />
        {/* TODO: insert drawing here */}
        <VolumeControl />
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

  },
});
