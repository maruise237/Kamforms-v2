import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { radius, typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

function GoogleIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"/>
      <Path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"/>
      <Path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33Z"/>
      <Path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"/>
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width="14" height="16" viewBox="0 0 16 18">
      <Path fill="#FFFFFF" d="M13.1 9.53c-.02-1.87 1.53-2.77 1.6-2.81-.87-1.27-2.23-1.45-2.72-1.47-1.16-.12-2.26.68-2.85.68-.59 0-1.5-.66-2.46-.64-1.27.02-2.44.74-3.09 1.87-1.32 2.28-.34 5.66.94 7.51.63.9 1.37 1.9 2.35 1.87.94-.04 1.3-.6 2.44-.6 1.14 0 1.46.6 2.46.58 1.02-.02 1.66-.92 2.28-1.83.72-1.05 1.02-2.07 1.03-2.12-.02-.01-1.98-.76-2-3.04ZM11.2 3.6c.52-.63.87-1.5.78-2.37-.75.03-1.66.5-2.2 1.12-.48.55-.9 1.44-.79 2.28.83.06 1.68-.42 2.21-1.03Z"/>
    </Svg>
  );
}

interface Props {
  onGooglePress?: () => void;
  onApplePress?: () => void;
}

export default function SocialRow({ onGooglePress, onApplePress }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onGooglePress}
        style={({ pressed }) => [{ borderColor: colors.line }, styles.google, pressed && styles.pressed]}
      >
        <GoogleIcon />
        <Text style={{ color: colors.bone, ...styles.label }}>Google</Text>
      </Pressable>
      <Pressable
        onPress={onApplePress}
        style={({ pressed }) => [styles.apple, pressed && styles.pressed]}
      >
        <AppleIcon />
        <Text style={styles.appleText}>Apple</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 12 },
  google: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.md, paddingVertical: 14, borderWidth: 1, backgroundColor: "transparent" },
  apple: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.md, paddingVertical: 14, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.7 },
  label: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  appleText: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium, color: "#0B0B0E" },
});
