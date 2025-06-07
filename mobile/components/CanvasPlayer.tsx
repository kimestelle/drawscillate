import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

export default function CanvasPlayer() {
    return (
        <View style={styles.canvas_player}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>
                <Text style={{ fontWeight: "bold" }}>draw</Text>scillator
              </Text>
              <TouchableOpacity>
                <Ionicons name="information-circle-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
        
            {/* Canvas Placeholder */}
            <View style={styles.canvas} />
        
            {/* Play + Tools */}
            <View style={styles.row}>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={32} color="black" />
              </TouchableOpacity>
              <View style={styles.iconGroup}>
                <TouchableOpacity>
                  <MaterialIcons name="edit" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <FontAwesome name="save" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  canvas_player: {
    
  },
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 20,
  },
  redrawIcon: {
    position: "absolute",
    top: 80,
    right: 40,
  },
  canvas: {
    width: 300,
    height: 180,
    borderWidth: 4,
    borderRadius: 20,
    borderColor: "black",
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
  },
  iconGroup: {
    flexDirection: "row",
    gap: 20,
  },
});