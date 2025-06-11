import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Octicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme, scaleWidth, scaleHeight } from './theme';

export default function CanvasPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <View style={styles.canvas_player}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={{ fontWeight: "bold" }}>draw</Text>scillator
        </Text>
        <View style={styles.infoAndHistory} >
          <TouchableOpacity>
            <Ionicons name="information-circle-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Octicons name="history" size={38} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas Placeholder */}
      <View style={styles.canvas} />

      {/* Play + Tools */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
          <View style={{ transform: [{ translateX: isPlaying ? scaleWidth(0) : scaleWidth(2) }] }}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={43} color="black" />
          </View>
        </TouchableOpacity>
        <View style={styles.iconGroup}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="eraser" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="save" size={40} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas_player: {
    // borderWidth: 1,
    // borderColor: "black"
  },
  infoAndHistory: {
    flexDirection: "row",
    alignItems: "center",
    gap: scaleWidth(15)
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 30,
  },
  canvas: {
    width: scaleWidth(292),
    height: scaleHeight(237),
    borderWidth: theme.borderWidth,
    borderRadius: 20,
    borderColor: "black",
    marginVertical: scaleHeight(11),

    backgroundColor: "white",
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: scaleHeight(2),
  },
  playButton: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: 100,
    borderWidth: theme.borderWidth,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  iconGroup: {
    flexDirection: "row",
    gap: scaleWidth(16),
  },
});
