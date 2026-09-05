import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { radius, typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import type { LucideIcon } from "lucide-react-native";

interface Props {
  children: string;
  icon?: LucideIcon;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

export default function PrimaryButton({
  children, icon: Icon, onPress, disabled, loading, style,
}: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [
        { backgroundColor: colors.signal },
        styles.base,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.bone} /> : (
        <View style={styles.content}>
          <Text style={{ color: colors.bone, ...styles.text }}>{children}</Text>
          {Icon && <Icon size={17} color={colors.bone} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: "100%", borderRadius: radius.md, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  text: { fontSize: 15, fontWeight: "700", fontFamily: typography.fontFamily.display },
});
