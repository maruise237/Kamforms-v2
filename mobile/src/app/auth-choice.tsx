import { View, Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useState, lazy, Suspense } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import KMark from "@/components/ui/KMark";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GhostButton from "@/components/ui/GhostButton";
import Divider from "@/components/ui/Divider";
import SocialRow from "@/components/ui/SocialRow";
import { useSocialAuth, useRedirectIfSignedIn } from "@/lib/useSocialAuth";

// ─── DebugPanel : lazy-importé uniquement en DEV (Phase 1.3) ────────
// En production, le panneau est complètement absent du bundle.
const DebugPanel = __DEV__
  ? lazy(() => import("@/components/DebugPanel"))
  : null as unknown as React.ComponentType<{ visible: boolean; onClose: () => void }>;

export default function AuthChoiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { startSocialLogin, loadingProvider, errorMessage } = useSocialAuth();
  const [debugVisible, setDebugVisible] = useState(false);
  useRedirectIfSignedIn();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <KMark size={40} />
        <View style={styles.hero}>
          <Text style={[styles.title, { color: colors.bone }]}>Bienvenue sur Kamforms</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Créez un compte pour générer votre premier formulaire et le connecter à WhatsApp.</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.actions}>
          <PrimaryButton icon={ArrowRight} onPress={() => router.push("/sign-in")}>Créer mon compte</PrimaryButton>
          <GhostButton onPress={() => router.push("/sign-in")}>J'ai déjà un compte</GhostButton>
          <Divider label="ou" />
          {loadingProvider ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.signal} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Connexion en cours...</Text>
            </View>
          ) : <SocialRow onGooglePress={() => startSocialLogin("google")} onApplePress={() => startSocialLogin("apple")} />}
          {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}
          <Text style={[styles.legal, { color: colors.textFaint }]}>En continuant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité de Kamforms.</Text>
          {__DEV__ && (
            <Pressable onPress={() => setDebugVisible(true)} style={styles.debugLink}>
              <Text style={[styles.debugLinkText, { color: colors.textFaint }]}>Diagnostic</Text>
            </Pressable>
          )}
        </View>
      </View>
      {__DEV__ && DebugPanel && (
        <Suspense fallback={null}>
          <DebugPanel visible={debugVisible} onClose={() => setDebugVisible(false)} />
        </Suspense>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  hero: { marginTop: 32 },
  title: { fontSize: 26, fontWeight: "700", fontFamily: typography.fontFamily.display, lineHeight: 32 },
  subtitle: { fontSize: 13.5, fontFamily: typography.fontFamily.body, lineHeight: 20, marginTop: 8 },
  spacer: { flex: 1 },
  actions: { gap: 12 },
  legal: { fontSize: 11, fontFamily: typography.fontFamily.body, textAlign: "center", lineHeight: 16, marginTop: 12 },
  error: { fontSize: 13, textAlign: "center" },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 14, fontFamily: typography.fontFamily.body },
  debugLink: { alignItems: "center", paddingVertical: 4 },
  debugLinkText: { fontSize: 11, fontFamily: typography.fontFamily.body, textDecorationLine: "underline" },
});
