import { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, ArrowLeft, Users } from "lucide-react-native";
import { colors as staticColors, typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import ProgressSegments from "@/components/ui/ProgressSegments";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GhostButton from "@/components/ui/GhostButton";
import BubbleToast from "@/components/ui/BubbleToast";
import { useRedirectIfSignedIn } from "@/lib/useSocialAuth";

const cardStyle = {
  borderRadius: radius.md, padding: 14, borderWidth: 1,
  borderColor: staticColors.line, backgroundColor: staticColors.graphite,
};
const chipStyle = {
  borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  backgroundColor: staticColors.graphiteSoft, borderWidth: 1, borderColor: staticColors.line,
};

const SLIDES = [
  { eyebrow: "01 · La promesse", title: "Un lien. Des réponses. Sur WhatsApp.", body: "Chaque soumission arrive en privé sur votre WhatsApp, formatée et lisible — plus besoin de surveiller une boîte mail.", visual: <BubbleToast /> },
  {
    eyebrow: "02 · La création", title: "L'IA écrit votre formulaire en secondes.", body: "Décrivez ce dont vous avez besoin en une phrase. Champs, validation et logique conditionnelle sont générés pour vous.",
    visual: (
      <View style={cardStyle}>
        <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.mono, color: staticColors.spark, marginBottom: 8 }}>6 champs générés · prêt à publier</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {["Nom complet", "Email", "Budget", "Délai", "Style", "Description"].map(t => (
            <View key={t} style={chipStyle}>
              <Text style={{ fontSize: 11, fontFamily: typography.fontFamily.body, color: staticColors.bone }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    ),
  },
  {
    eyebrow: "03 · L'équipe", title: "Zéro relance, zéro flou.", body: "Clients, participants ou collaborateurs : un lien ciblé, des réponses structurées, sans reposer la même question quinze fois.",
    visual: (
      <View style={[cardStyle, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
        <Users size={18} color={staticColors.signal} />
        <Text style={{ fontSize: 12.5, fontFamily: typography.fontFamily.body, color: staticColors.textMuted, flex: 1 }}>Jusqu'à 20 collaborateurs, chacun voit ce dont il a besoin</Text>
      </View>
    ),
  },
];

export default function WelcomeScreen() {
  const [i, setI] = useState(0);
  const router = useRouter();
  const { colors } = useTheme();
  useRedirectIfSignedIn();
  const s = SLIDES[i];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <ProgressSegments step={i + 1} total={3} />
        <Text style={[styles.eyebrow, { color: colors.spark }]}>{s.eyebrow}</Text>
        <Text style={[styles.title, { color: colors.bone }]}>{s.title}</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>{s.body}</Text>
        <View style={styles.visual}>{s.visual}</View>
        <View style={styles.spacer} />
        <View style={styles.buttons}>
          {i > 0 && (
            <GhostButton onPress={() => setI(i - 1)} style={styles.backBtn}>
              <ArrowLeft size={16} color={colors.bone} />
            </GhostButton>
          )}
          <View style={i > 0 ? styles.nextBtnWide : styles.nextBtnFull}>
            <PrimaryButton icon={ArrowRight} onPress={() => { i < 2 ? setI(i + 1) : router.replace("/auth-choice" as any); }}>
              {i < 2 ? "Suivant" : "Commencer"}
            </PrimaryButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  eyebrow: { fontSize: 11, fontFamily: typography.fontFamily.mono, letterSpacing: 1, textTransform: "uppercase", marginTop: 24 },
  title: { fontSize: 26, fontWeight: "700", fontFamily: typography.fontFamily.display, lineHeight: 32, marginTop: 8 },
  body: { fontSize: 13.5, fontFamily: typography.fontFamily.body, lineHeight: 20, marginTop: 12 },
  visual: { marginTop: 24 },
  spacer: { flex: 1 },
  buttons: { flexDirection: "row", gap: 12, alignItems: "center" },
  backBtn: { width: 56, paddingVertical: 14, alignItems: "center" },
  nextBtnWide: { flex: 1 },
  nextBtnFull: { width: "100%" },
});
