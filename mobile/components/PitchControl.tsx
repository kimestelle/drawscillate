import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function PitchControl() {
    return (
        <View style={styles.pitch_control}>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>C3</Text>
              <Text style={styles.noteSub}>scrollable</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  pitch_control: {
    
  },
  noteBox: {
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "black",
    padding: 10,
    alignItems: "center",
    marginRight: 30,
  },
  noteText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noteSub: {
    fontSize: 10,
  },
});