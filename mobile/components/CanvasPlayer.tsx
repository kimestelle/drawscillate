import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Octicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { theme, scaleWidth, scaleHeight } from './theme';
import DrawableCanvas, { DrawableCanvasRef } from "./DrawableCanvas";
import { pointsToWave, float32ToWav, arrayBufferToBase64 } from "./utils/waveHelpers";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function CanvasPlayer() {
  const volume = 1;
  const sampleRateGlobal = 44100;
  const samplesPerCycle = 341;
  //TODO: slider to change this
  const repeatCount = 50;

  const frequencyHz = sampleRateGlobal / samplesPerCycle;
  const wavelengthSeconds = 1 / frequencyHz;

  console.log("Wavelength (s): ", wavelengthSeconds);
  console.log("Frequency (Hz): ", frequencyHz);

  const [isPlaying, setIsPlaying] = useState(false);
  const [wavePoints, setWavePoints] = useState<Float32Array | null>(null);
  const canvasRef = useRef<DrawableCanvasRef>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const clearCanvas = () => {
    canvasRef.current?.clear();
  };

  //initialize audio from expo-av
  async function initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      });
    } catch (error) {
      console.error('Error initializing audio system:', error);
    }
  }

  useEffect(() => {
    initializeAudio();
  }, []);

  const processAndStorePoints = async () => {
    const points = canvasRef.current?.getPoints() || [];
    if (points.length === 0) return;
    console.log("Processing points:", points);

    const canvasWidth = scaleWidth(292);
    const canvasHeight = scaleHeight(237);

    const wave = pointsToWave(points, canvasWidth, canvasHeight, samplesPerCycle);
    setWavePoints(wave);
    console.log("processed wave:", wave);

    const wavBuffer = float32ToWav(wave, volume, sampleRateGlobal, repeatCount);
    //convert array buffer to base64
    console.log("wavBuffer slice:", new Uint8Array(wavBuffer).slice(44, 54)); // Skip header

    const base64 = arrayBufferToBase64(wavBuffer);

    //write to fild
    const fileUri = FileSystem.documentDirectory + "wave.wav";
    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: "base64" });
    console.log("WAV written to:", fileUri);
    setFileUri(fileUri);
    //play sound
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();
  };

  const playWave = useCallback(async () => {
    if (!fileUri) {
      console.warn("file uri unreachable");
      return;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );
    await sound.playAsync();
    console.log("Playing sound from:", fileUri);
  }, [fileUri]);

  useEffect(() => {
    if (isPlaying && wavePoints) {
      playWave();
    }
  }, [isPlaying, wavePoints, playWave]);

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

      <DrawableCanvas
        ref={canvasRef}
        style={styles.canvas}
        width={scaleWidth(292)}
        height={scaleHeight(237)}
      />

      {/* Play + Tools */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
          <View style={{ transform: [{ translateX: isPlaying ? scaleWidth(0) : scaleWidth(2) }] }}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={43} color="black" />
          </View>
        </TouchableOpacity>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={clearCanvas}>
            <MaterialCommunityIcons name="eraser" size={40} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={processAndStorePoints}>
            <FontAwesome name="save" size={40} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas_player: {},
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
