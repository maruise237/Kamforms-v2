import React from "react";
import { StyleSheet, View } from "react-native";
import { radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import type { LucideIcon } from "lucide-react-native";

interface Props {
  icon: LucideIcon;
  bg?: string;
  color?: string;
  size?: number;
}

export default function IconTile({
  icon: Icon, bg: explicitBg, color: explicitColor, size = 46,
}: Props) {
  const { colors } = useTheme();
  const bg = explicitBg ?? colors.graphiteSoft;
  const iconColor = explicitColor ?? colors.textMuted;
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg }]}>
      <Icon size={size * 0.46} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: "center", justifyContent: "center", borderRadius: radius.md },
});
