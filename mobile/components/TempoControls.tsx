import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScrollBox from "./Scrollbox";
import { theme, scaleWidth, scaleHeight } from './theme';

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
              <ScrollBox label={"BPM"} initialValue={128} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  tempo_controls: {
    // borderWidth: 1,
    // borderColor: "black",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: scaleWidth(20)
  },
  dots: {
    flexDirection: "row",
    marginRight: 30,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: "black",
    marginHorizontal: 7,
    opacity: 0.2,
  },
  activeDot: {
    opacity: 1,
  },
  resolutionBox: {
    borderWidth: theme.borderWidth,
    borderColor: "black",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 6,
  },
  resolutionText: {
    fontSize: 18,
    fontWeight: "normal",
  },
});