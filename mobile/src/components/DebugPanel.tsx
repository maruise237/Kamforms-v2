import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { clearDebugEntries, getDebugEntries, subscribeDebug, type DebugEntry } from "@/lib/debugLog";
import { useTheme } from "@/context/ThemeContext";

/**
 * Panneau de diagnostic : affiche le journal dlog() (connexion OAuth,
 * session Clerk, SecureStore, push…). Ouvrez-le depuis l'écran de
 * connexion, reproduisez le bug, puis photographiez l'écran.
 */
export default function DebugPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<DebugEntry[]>(getDebugEntries());

  useEffect(() => subscribeDebug(() => setEntries([...getDebugEntries()])), []);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <View style={[styles.header, { borderBottomColor: colors.line }]}>
          <Text style={[styles.title, { color: colors.bone }]}>Journal de diagnostic</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={clearDebugEntries} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: colors.textMuted }]}>Effacer</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: colors.signal }]}>Fermer</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {entries.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textFaint }]}>Aucun événement pour le moment.</Text>
          ) : (
            entries.map((e, i) => (
              <Text key={i} style={[styles.line, { color: colors.bone }]} selectable>
                <Text style={{ color: colors.textFaint }}>{e.at} </Text>
                <Text style={{ color: colors.signal }}>[{e.tag}]</Text> {e.msg}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 16 },
  headerBtn: { paddingVertical: 4 },
  headerBtnText: { fontSize: 14, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 6 },
  empty: { fontSize: 13, textAlign: "center", marginTop: 32 },
  line: { fontSize: 11.5, fontFamily: "monospace", lineHeight: 17 },
});
