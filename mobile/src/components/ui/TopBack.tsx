import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  label?: string;
  onPress?: () => void;
}

export default function TopBack({ label = "Retour", onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <ArrowLeft size={15} color={colors.textMuted} />
      <Text style={{ color: colors.textMuted, ...styles.label }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
});
