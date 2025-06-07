import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TempoControls() {
    return (
        <View style={styles.tempo_controls}>
            {/* Page Dots + Resolution */}
            <View style={styles.row}>
              <View style={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.dot, i === 1 && styles.activeDot]} />
                ))}
              </View>
              <View style={styles.resolutionBox}>
                <Text style={styles.resolutionText}>128</Text>
              </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  tempo_controls: {
    
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dots: {
    flexDirection: "row",
    marginRight: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "black",
    marginHorizontal: 4,
    opacity: 0.2,
  },
  activeDot: {
    opacity: 1,
  },
  resolutionBox: {
    borderWidth: 3,
    borderColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resolutionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});