import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CheckCircle2, Award } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import BubbleToast from "@/components/ui/BubbleToast";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GhostButton from "@/components/ui/GhostButton";

export default function SuccessScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.signalSoft }]}>
          <CheckCircle2 size={34} color={colors.signal} />
        </View>
        <Text style={[styles.title, { color: colors.bone }]}>Votre formulaire est prêt</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>Partagez le lien. Chaque réponse arrivera directement ici.</Text>
        <View style={styles.toastArea}><BubbleToast /></View>
        <View style={[styles.badgeRow, { backgroundColor: colors.sparkSoft }]}>
          <Award size={16} color={colors.spark} />
          <Text style={[styles.badgeText, { color: colors.spark }]}>Badge débloqué — Premier formulaire</Text>
          <Text style={[styles.badgeXp, { color: colors.spark }]}>+50 XP</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.actions}>
          <PrimaryButton onPress={() => router.replace("/(tabs)")}>Voir mon formulaire</PrimaryButton>
          <GhostButton onPress={() => router.replace("/(tabs)")}>Partager le lien</GhostButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32, alignItems: "center" },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginTop: 16 },
  title: { fontSize: 22, fontWeight: "700", fontFamily: typography.fontFamily.display, textAlign: "center", marginTop: 20 },
  body: { fontSize: 13.5, fontFamily: typography.fontFamily.body, textAlign: "center", marginTop: 8, lineHeight: 20 },
  toastArea: { width: "100%", marginTop: 24 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, marginTop: 16 },
  badgeText: { fontSize: 12.5, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  badgeXp: { fontSize: 11, fontFamily: typography.fontFamily.mono },
  spacer: { flex: 1 },
  actions: { width: "100%", gap: 12 },
});
