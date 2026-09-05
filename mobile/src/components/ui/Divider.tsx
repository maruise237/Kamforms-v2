import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  label?: string;
}

export default function Divider({ label = "ou" }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: colors.line, ...styles.line }} />
      <Text style={{ color: colors.textFaint, ...styles.label }}>{label}</Text>
      <View style={{ backgroundColor: colors.line, ...styles.line }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1 },
  label: { fontSize: 11, fontFamily: typography.fontFamily.mono, textTransform: "uppercase", letterSpacing: 1 },
});
