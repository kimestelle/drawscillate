import React, { useState, useRef, useEffect } from "react";
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

type ScrollBoxProps = {
  label: string;
  initialValue: number | string; // number or note string like "C4"
};

const NOTES = [
  "C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0",
  "C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1",
  "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
  "C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6",
  "C7"
];

export default function ScrollBox({ label, initialValue }: ScrollBoxProps) {
  // Mode flags
  const isNumberMode = typeof initialValue === "number";
  const isNoteMode = typeof initialValue === "string";

  // State depends on mode:
  // - number: value is the integer itself
  // - note: value is index in NOTES array
  const initialIndex = isNoteMode ? NOTES.indexOf(initialValue) : -1;

  const [value, setValue] = useState<number>(() => {
    if (isNumberMode) return Math.max(0, initialValue as number);
    else if (isNoteMode && initialIndex >= 0) return initialIndex;
    else return 0; // fallback
  });

  const baseThreshold = 4;
  const incrementFactor = 10;

  const lastDyRef = useRef(0);
  const momentumVelocityRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const clampValue = (val: number) => {
    if (isNumberMode) {
      return Math.max(0, val); // no upper bound
    } else if (isNoteMode) {
      if (val < 0) return 0;
      if (val >= NOTES.length) return NOTES.length - 1;
      return val;
    }
    return val;
  };

  const applyMomentum = () => {
    const friction = 0.95;

    if (Math.abs(momentumVelocityRef.current) < 0.01) {
      momentumVelocityRef.current = 0;
      animationFrameId.current = null;
      return;
    }

    const delta = momentumVelocityRef.current * 10;

    if (Math.abs(delta) > baseThreshold * incrementFactor) {
      setValue((prev) => {
        let next = prev + Math.round(-delta / (baseThreshold * incrementFactor));
        next = clampValue(next);
        triggerHaptic();
        return next;
      });
    }

    momentumVelocityRef.current *= friction;
    animationFrameId.current = requestAnimationFrame(applyMomentum);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dy) > baseThreshold,

      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
          momentumVelocityRef.current = 0;
        }

        const dy = gestureState.dy;
        const vy = gestureState.vy;

        const velocityScale = Math.min(Math.abs(vy) * 10, 5);
        const deltaRaw = (dy - lastDyRef.current) * velocityScale;

        if (Math.abs(deltaRaw) < baseThreshold * incrementFactor) return;

        const incrementCount = Math.round(-deltaRaw / (baseThreshold * incrementFactor));
        if (incrementCount !== 0) {
          lastDyRef.current = dy;
          setValue((prev) => {
            let next = prev + incrementCount;
            next = clampValue(next);
            triggerHaptic();
            return next;
          });
        }
      },

      onPanResponderRelease: (_evt, gestureState) => {
        lastDyRef.current = 0;
        momentumVelocityRef.current = -gestureState.vy;

        if (!animationFrameId.current) {
          animationFrameId.current = requestAnimationFrame(applyMomentum);
        }
      },
    })
  ).current;

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Display text depends on mode
  const displayText = isNumberMode ? value.toString() : NOTES[value];

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.noteBox} {...panResponder.panHandlers}>
        <Text style={styles.noteText}>{displayText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  text: {
    fontSize: 18,
    fontWeight: "normal",
  },
  noteBox: {
    width: scaleWidth(85),
    height: scaleHeight(62),
    borderWidth: theme.borderWidth,
    borderRadius: 6,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "white",
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  noteText: {
    fontSize: 30,
    fontWeight: "normal",
  },
});
