import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { theme, scaleHeight, scaleWidth } from "./theme";
import * as Haptics from "expo-haptics";

export default function VolumeControl() {
  const [volume, setVolume] = useState(0.4); // 0 to 1
  const containerHeight = scaleHeight(241);
  const volumeRef = useRef(volume);
  const lastHapticRef = useRef(Math.floor(volume * 10)); // track last threshold

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        let delta = -gestureState.dy / containerHeight; // Drag up = increase
        let newVolume = Math.max(0, Math.min(1, volumeRef.current + delta));
        const newThreshold = Math.floor(newVolume * 10);
        if (newThreshold !== lastHapticRef.current) {
          lastHapticRef.current = newThreshold;
          Haptics.selectionAsync();
        }
        setVolume(newVolume);
      },
      onPanResponderGrant: () => {
        volumeRef.current = volume;
        lastHapticRef.current = Math.floor(volume * 10);
      },
    })
  ).current;

  return (
    <View style={styles.volume_control}>
      <Text style={styles.text}>VOL</Text>
      <View style={styles.volumeBarContainer} {...panResponder.panHandlers}>
        <View style={[styles.volumeBar, { height: `${volume * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  volume_control: {
    flexDirection: "column",
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  volumeBarContainer: {
    width: scaleWidth(59),
    height: scaleHeight(241),
    borderWidth: theme.borderWidth,
    borderColor: "black",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  volumeBar: {
    width: "100%",
    backgroundColor: "black",
  },
  text: {
    fontSize: 18,
    fontWeight: "normal",
  },
});
