import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Sparkles, Palette, CheckCircle2, ChevronRight } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import IconTile from "@/components/ui/IconTile";
import PrimaryButton from "@/components/ui/PrimaryButton";

const ITEMS = [
  { icon: Sparkles, label: "Créer votre premier formulaire", done: false, next: true },
  { icon: Palette, label: "Personnaliser vos couleurs", done: false },
];

export default function ChecklistScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const done = ITEMS.filter((i) => i.done).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.bone }]}>Configurez votre espace</Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statsLabel, { color: colors.textMuted }]}>{done} sur {ITEMS.length} étapes terminées</Text>
          <View style={[styles.xpBadge, { backgroundColor: colors.sparkSoft }]}>
            <Text style={[styles.xpText, { color: colors.spark }]}>+50 XP</Text>
          </View>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.line }]}>
          <View style={[styles.progressFill, { width: `${(done / ITEMS.length) * 100}%`, backgroundColor: colors.signal }]} />
        </View>
        <View style={styles.list}>
          {ITEMS.map((it) => (
            <View key={it.label} style={[{ borderColor: it.next ? colors.signal : colors.line, backgroundColor: colors.graphite }, styles.item]}>
              <IconTile icon={it.icon} bg={it.done ? colors.signalSoft : colors.graphiteSoft} color={it.done ? colors.signal : colors.textMuted} size={38} />
              <Text style={[{ color: it.done ? colors.textMuted : colors.bone }, styles.itemLabel, it.done && { textDecorationLine: "line-through" }]}>
                {it.label}
              </Text>
              {it.done ? <CheckCircle2 size={19} color={colors.signal} /> : <ChevronRight size={18} color={colors.textFaint} />}
            </View>
          ))}
        </View>
        <View style={styles.spacer} />
        <PrimaryButton icon={ArrowRight} onPress={() => router.push("/onboarding/create-form" as any)}>Créer mon premier formulaire</PrimaryButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", fontFamily: typography.fontFamily.display },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  statsLabel: { fontSize: 12, fontFamily: typography.fontFamily.body },
  xpBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  xpText: { fontSize: 11, fontFamily: typography.fontFamily.mono },
  progressBg: { height: 8, borderRadius: 4, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  list: { gap: 10, marginTop: 24 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14, borderWidth: 1 },
  itemLabel: { flex: 1, fontSize: 13.5, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  spacer: { flex: 1 },
});
