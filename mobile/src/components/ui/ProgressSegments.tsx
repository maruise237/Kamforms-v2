import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  step: number;
  total: number;
}

export default function ProgressSegments({ step, total }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: i < step ? colors.signal : colors.line }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 6, width: "100%" },
  segment: { height: 4, flex: 1, borderRadius: 2 },
});
