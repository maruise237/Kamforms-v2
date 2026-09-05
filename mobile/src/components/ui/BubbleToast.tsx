import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import KMark from "./KMark";

interface Props {
  title?: string;
  body?: string;
}

export default function BubbleToast({
  title = "Kamforms", body = "Nouvelle réponse reçue — Formulaire de devis",
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ borderColor: colors.line, backgroundColor: colors.graphite, ...styles.container }}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <KMark size={20} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: colors.signal, borderColor: colors.graphite }]} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.header}>
          <Text style={{ color: colors.bone, ...styles.title }}>{title}</Text>
          <Text style={{ color: colors.textFaint, ...styles.timestamp }}>à l'instant</Text>
        </View>
        <Text style={{ color: colors.textMuted, ...styles.body }}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: radius.md, padding: 14, borderWidth: 1,
  },
  avatarWrapper: { position: "relative", flexShrink: 0 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#0B0B0E" },
  statusDot: { position: "absolute", bottom: -1, right: -2, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  textContainer: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 13, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold },
  timestamp: { fontSize: 11, fontFamily: typography.fontFamily.mono },
  body: { fontSize: 12.5, marginTop: 2, lineHeight: 16, fontFamily: typography.fontFamily.body },
});
