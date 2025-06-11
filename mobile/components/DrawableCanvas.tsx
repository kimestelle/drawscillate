import React, { useState, useImperativeHandle, forwardRef } from "react";
import { View, PanResponder, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Line } from "react-native-svg";

type DrawableCanvasProps = {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

export type DrawableCanvasRef = {
  clear: () => void;
};

const DrawableCanvas = forwardRef<DrawableCanvasRef, DrawableCanvasProps>(
  ({ width, height, style }, ref) => {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>("");

    const clamp = (val: number, min: number, max: number) =>
        Math.min(Math.max(val, min), max);

        const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
            const { locationX, locationY } = e.nativeEvent;
            const clampedX = clamp(locationX, 0, width-10);
            const clampedY = clamp(locationY, 0, height-10);
            setCurrentPath(`M${clampedX},${clampedY}`);
        },
        onPanResponderMove: (e) => {
            const { locationX, locationY } = e.nativeEvent;
            const clampedX = clamp(locationX, 0, width-10);
            const clampedY = clamp(locationY, 0, height-10);
            setCurrentPath((prev) => `${prev} L${clampedX},${clampedY}`);
        },
        onPanResponderRelease: () => {
            setPaths((prev) => [...prev, currentPath]);
            setCurrentPath("");
        },
    });


    // Expose clear method to parent via ref
    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setCurrentPath("");
      },
    }));

    return (
      <View
        {...panResponder.panHandlers}
        style={[
          {
            width,
            height,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          style,
        ]}
      >
        <Svg width="100%" height="100%">
          <Line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="#ccc" // light gray color
            strokeWidth={6} // thin line
            strokeDasharray="4 4" // optional dashed line for subtlety
          />

          {paths.map((d, i) => (
            <Path key={i} d={d} stroke="blue" strokeWidth={6} fill="none" />
          ))}
          {currentPath !== "" && (
            <Path d={currentPath} stroke="blue" strokeWidth={6} fill="none" />
          )}
        </Svg>
      </View>
    );
  }
);

export default DrawableCanvas;
