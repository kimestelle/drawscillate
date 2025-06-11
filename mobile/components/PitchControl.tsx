import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from './theme';
import ScrollBox from "./Scrollbox";


export default function PitchControl() {
    return (
        <View style={styles.pitch_control}>
            <ScrollBox label={"PITCH"} initialValue={"C4"} />
        </View>
    );
}

const styles = StyleSheet.create({
  pitch_control: {
    
  }
});