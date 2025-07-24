import React, { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { View, PanResponder, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Line } from "react-native-svg";
import { Point } from "react-native-svg/lib/typescript/elements/Shape";

type DrawableCanvasProps = {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
};

export type DrawableCanvasRef = {
  clear: () => void;
  getPoints: () => Point[];
};

const DrawableCanvas = forwardRef<DrawableCanvasRef, DrawableCanvasProps>(
  ({ width, height, style }, ref) => {
    const [fullPath, setFullPath] = useState<string>("");
    const drawingRef = useRef(false);
    const lastPointRef = useRef<Point | null>(null);
    const pointsRef = useRef<Point[]>([]);

    const clamp = (val: number, min: number, max: number) =>
      Math.min(Math.max(val, min), max);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const x = clamp(locationX, 0, width - 10);
        const y = clamp(locationY, 0, height - 10);
        const last = lastPointRef.current;

        let segment = "";
        if (!last) {
          // First stroke: baseline to point
          segment = `M0,${height / 2} L${x},${y}`;
        } else if (x > last.x) {
          segment = `M${last.x},${last.y} L${x},${y}`;
        } else {
          drawingRef.current = false;
          return;
        }

        setFullPath((prev) => `${prev} ${segment}`);
        lastPointRef.current = { x, y };
        pointsRef.current = [{ x, y }];
        drawingRef.current = true;
      },

      onPanResponderMove: (e) => {
        if (!drawingRef.current) return;

        const { locationX, locationY } = e.nativeEvent;
        const x = clamp(locationX, 0, width - 10);
        const y = clamp(locationY, 0, height - 10);
        const last = lastPointRef.current;

        if (!last || x <= last.x) return;

        const segment = `L${x},${y}`;
        setFullPath((prev) => `${prev} ${segment}`);
        lastPointRef.current = { x, y };
        pointsRef.current.push({ x, y });
      },

      onPanResponderRelease: () => {
        drawingRef.current = false;
      },
    });

    useImperativeHandle(ref, () => ({
      clear() {
        setFullPath('');
        lastPointRef.current = null;
        pointsRef.current = [];
      },
      getPoints() {
        return pointsRef.current;
      }
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
            stroke="#ccc"
            strokeWidth={6}
            strokeDasharray="4 4"
          />
          {fullPath !== "" && (
            <Path d={fullPath} stroke="blue" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          )}

          {[1, 2, 3].map((dist) => 
            <Line
                key={dist}
                x1={width * dist / 4}
                y1={0}
                x2={width * dist / 4}
                y2={height}
                stroke="#ccc" // light gray color
                opacity={0.2}
                strokeWidth={2} // thin line
            />
          )}

        </Svg>
      </View>
    );
  }
);

DrawableCanvas.displayName = "DrawableCanvas";
export default DrawableCanvas;
