import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { radius, spacing, typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  type?: "text" | "password";
  right?: React.ReactNode;
  mono?: boolean;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function Field({
  label, placeholder, value, onChangeText, type = "text",
  right, mono, editable = true, keyboardType, autoCapitalize,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.textMuted, ...styles.label }}>{label}</Text>
      <View style={{ borderColor: colors.line, backgroundColor: colors.graphite, ...styles.inputRow }}>
        <TextInput
          style={{ color: colors.bone, ...styles.input, ...(mono ? styles.monoInput : {}) }}
          value={value} onChangeText={onChangeText}
          placeholder={placeholder} placeholderTextColor={colors.textFaint}
          secureTextEntry={type === "password"}
          editable={editable} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize} autoCorrect={false}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "column", gap: spacing.sm },
  label: { fontSize: 12, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  inputRow: {
    flexDirection: "row", alignItems: "center", borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: 14, borderWidth: 1,
  },
  input: { flex: 1, backgroundColor: "transparent", fontSize: 14, fontFamily: typography.fontFamily.body, padding: 0 },
  monoInput: { fontFamily: typography.fontFamily.mono },
});
