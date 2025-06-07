import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function VolumeControl() {
    return (
        <View style={styles.volume_control}>
            <View style={styles.volumeBarContainer}>
                <View style={styles.volumeBar} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  volume_control: {
    
  },
  volumeBarContainer: {
    width: 40,
    height: 120,
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  volumeBar: {
    width: "100%",
    height: "40%",
    backgroundColor: "black",
  },
});