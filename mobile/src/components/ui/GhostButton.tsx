import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { radius, typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}

export default function GhostButton({ children, onPress, style }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { borderColor: colors.line },
        styles.base,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={{ color: colors.bone, ...styles.text }}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%", borderWidth: 1, borderRadius: radius.md,
    paddingVertical: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: "transparent",
  },
  pressed: { opacity: 0.7 },
  text: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold },
});
