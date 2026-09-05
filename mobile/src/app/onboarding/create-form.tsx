import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import TopBack from "@/components/ui/TopBack";
import PrimaryButton from "@/components/ui/PrimaryButton";

const MODES = [{ key: "single", label: "Page unique" }, { key: "multi", label: "Multi-étapes" }];

export default function CreateFormScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [mode, setMode] = useState("multi");
  const [prompt, setPrompt] = useState("Formulaire de devis pour graphiste — budget, délai, style et références");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <TopBack label="Espace" onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.bone }]}>Décrivez votre formulaire</Text>
        <View style={styles.modeRow}>
          {MODES.map((o) => (
            <Pressable key={o.key} onPress={() => setMode(o.key)}
              style={[{ borderColor: mode === o.key ? colors.signal : colors.line }, styles.modeChip]}>
              <Text style={[{ color: mode === o.key ? colors.signal : colors.textMuted }, styles.modeChipText]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.promptCard]}>
          <TextInput
            style={{ color: colors.bone, ...styles.promptInput }}
            value={prompt} onChangeText={setPrompt}
            multiline numberOfLines={4} maxLength={2000}
          />
        </View>
        <Text style={[styles.hint, { color: colors.textFaint }]}>Entrée pour générer</Text>
        <View style={styles.spacer} />
        <PrimaryButton icon={Sparkles} onPress={() => router.push("/onboarding/success" as any)}>Générer avec l'IA</PrimaryButton>
        <Text style={[styles.subHint, { color: colors.textFaint }]}>Prêt en quelques secondes</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", fontFamily: typography.fontFamily.display, marginTop: 8 },
  modeRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  modeChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  modeChipText: { fontSize: 12, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  promptCard: { borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1 },
  promptInput: { fontSize: 13.5, fontFamily: typography.fontFamily.body, lineHeight: 20, padding: 0, textAlignVertical: "top", minHeight: 80 },
  hint: { fontSize: 11, fontFamily: typography.fontFamily.mono, marginTop: 8 },
  spacer: { flex: 1 },
  subHint: { fontSize: 11.5, fontFamily: typography.fontFamily.body, textAlign: "center", marginTop: 10 },
});
