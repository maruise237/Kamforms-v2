import { useState, lazy, Suspense } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { colors as staticColors, typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import TopBack from "@/components/ui/TopBack";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Divider from "@/components/ui/Divider";
import SocialRow from "@/components/ui/SocialRow";
import { dlog } from "@/lib/debugLog";
import { useSocialAuth, useRedirectIfSignedIn } from "@/lib/useSocialAuth";

// ─── DebugPanel : lazy-importé uniquement en DEV (Phase 1.3) ────────
const DebugPanel = __DEV__
  ? lazy(() => import("@/components/DebugPanel"))
  : null as unknown as React.ComponentType<{ visible: boolean; onClose: () => void }>;

type Mode = "sign-in" | "sign-up" | "verify";

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { startSocialLogin, loadingProvider, errorMessage: oauthError } = useSocialAuth();
  useRedirectIfSignedIn();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [debugVisible, setDebugVisible] = useState(false);

  const isLoaded = signInLoaded && signUpLoaded;

  async function handleSignIn() {
    if (!isLoaded) return;
    setBusy(true); setError(null);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
      dlog("email", `signIn.create statut=${result.status}`);
      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        dlog("email", "setActive OK → navigation vers les onglets");
        router.replace("/(tabs)" as any);
      } else if (result.status === "needs_second_factor") {
        // Clerk demande un second facteur (OTP) — on passe en mode vérification
        setMode("verify");
      } else {
        setError("Connexion incomplète — vérifiez vos identifiants.");
      }
    } catch (err) {
      dlog("email", `ERREUR signIn: ${err instanceof Error ? err.message : String(err)}`);
      setError(readableError(err));
    }
    finally { setBusy(false); }
  }

  async function handleSignUp() {
    if (!isLoaded) return;
    setBusy(true); setError(null);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
    } catch (err) { setError(readableError(err)); }
    finally { setBusy(false); }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    setBusy(true); setError(null);
    try {
      // Tentative de vérification email d'abord (sign-up)
      if (signUp?.status === "missing_requirements") {
        const result = await signUp.attemptEmailAddressVerification({ code: code.trim() });
        dlog("email", `verify signUp statut=${result.status}`);
        if (result.status === "complete") {
          await setActiveSignUp({ session: result.createdSessionId });
          router.replace("/(tabs)" as any);
          return;
        }
      }
      // Sinon, tentative second facteur (sign-in 2FA)
      if (signIn?.status === "needs_second_factor") {
        const result = await signIn.attemptSecondFactor({ code: code.trim(), strategy: "totp" });
        dlog("email", `verify 2FA statut=${result.status}`);
        if (result.status === "complete") {
          await setActiveSignIn({ session: result.createdSessionId });
          router.replace("/(tabs)" as any);
          return;
        }
      }
      setError("Code invalide ou expiré — réessayez.");
    } catch (err) {
      dlog("email", `ERREUR verify: ${err instanceof Error ? err.message : String(err)}`);
      setError(readableError(err));
    }
    finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TopBack onPress={() => router.back()} />

          <Text style={[styles.title, { color: colors.bone }]}>
            {mode === "verify" ? "Vérification" : mode === "sign-in" ? "Connexion" : "Créer un compte"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {mode === "verify"
              ? "Saisissez le code reçu par email pour finaliser."
              : mode === "sign-in"
                ? "Accédez à vos formulaires et vos réponses WhatsApp."
                : "Rejoignez Kamforms pour gérer vos formulaires sur mobile."}
          </Text>

          {mode !== "verify" && (
            <>
              {loadingProvider ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.signal} />
                  <Text style={[styles.loadingText, { color: colors.textMuted }]}>Connexion en cours...</Text>
                </View>
              ) : (
                <SocialRow onGooglePress={() => startSocialLogin("google")} onApplePress={() => startSocialLogin("apple")} />
              )}
              <Divider label="ou" />
            </>
          )}

          {mode === "verify" ? (
            <View style={styles.form}>
              <Text style={[styles.verifyLabel, { color: colors.textMuted }]}>Code de vérification</Text>
              <View style={{ borderColor: colors.line, backgroundColor: colors.graphite, ...styles.verifyRow }}>
                <TextInput
                  style={{ color: colors.bone, ...styles.verifyInput }}
                  value={code} onChangeText={setCode}
                  placeholder="123456" placeholderTextColor={colors.textFaint}
                  keyboardType="number-pad" autoFocus
                />
              </View>
              <View style={{ marginTop: 8 }}>
                <PrimaryButton onPress={handleVerify} disabled={code.trim().length < 6} loading={busy}>Vérifier</PrimaryButton>
              </View>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Adresse email</Text>
              <View style={{ borderColor: colors.line, backgroundColor: colors.graphite, ...styles.fieldRow }}>
                <TextInput
                  style={{ color: colors.bone, ...styles.fieldInput }}
                  value={email} onChangeText={setEmail}
                  placeholder="nom@exemple.com" placeholderTextColor={colors.textFaint}
                  keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Mot de passe</Text>
              <View style={{ borderColor: colors.line, backgroundColor: colors.graphite, ...styles.fieldRow }}>
                <TextInput
                  style={{ color: colors.bone, ...styles.fieldInput }}
                  value={password} onChangeText={setPassword}
                  placeholder="········" placeholderTextColor={colors.textFaint}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 8 }}>
                  {showPassword ? <EyeOff size={16} color={colors.textMuted} /> : <Eye size={16} color={colors.textMuted} />}
                </Pressable>
              </View>

              <PrimaryButton
                onPress={mode === "sign-in" ? handleSignIn : handleSignUp}
                disabled={!email.trim() || password.length < 8}
                loading={busy}
              >
                {mode === "sign-in" ? "Se connecter" : "Créer mon compte"}
              </PrimaryButton>

              <Pressable onPress={() => { setError(null); setMode(mode === "sign-in" ? "sign-up" : "sign-in"); }} style={styles.switchMode}>
                <Text style={[styles.switchModeText, { color: colors.textMuted }]}>
                  {mode === "sign-in" ? "Pas encore de compte ? " : "Déjà un compte ? "}
                  <Text style={{ fontWeight: "600", color: colors.bone }}>{mode === "sign-in" ? "Créer un compte" : "Se connecter"}</Text>
                </Text>
              </Pressable>
            </View>
          )}

          {error || oauthError ? <Text style={[styles.error, { color: colors.danger }]}>{error ?? oauthError}</Text> : null}

          {__DEV__ && (
            <Pressable onPress={() => setDebugVisible(true)} style={styles.debugLink}>
              <Text style={[styles.debugLinkText, { color: colors.textFaint }]}>Diagnostic</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {__DEV__ && DebugPanel && (
        <Suspense fallback={null}>
          <DebugPanel visible={debugVisible} onClose={() => setDebugVisible(false)} />
        </Suspense>
      )}
    </SafeAreaView>
  );
}

function readableError(err: unknown): string {
  const clerkMessage = err && typeof err === "object" && "errors" in err
    ? (err as { errors?: { longMessage?: string }[] }).errors?.[0]?.longMessage
    : undefined;
  return clerkMessage ?? "Une erreur est survenue lors de l'authentification. Réessayez.";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", fontFamily: typography.fontFamily.display, marginTop: 8 },
  subtitle: { fontSize: 13, fontFamily: typography.fontFamily.body, marginTop: 4, lineHeight: 18, marginBottom: 24 },
  form: { gap: 16, marginTop: 4 },
  fieldLabel: { fontSize: 12, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium, marginBottom: -8 },
  fieldRow: { flexDirection: "row", alignItems: "center", borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  fieldInput: { flex: 1, fontSize: 14, fontFamily: typography.fontFamily.body, padding: 0 },
  verifyLabel: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  verifyRow: { borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  verifyInput: { fontSize: 18, fontFamily: typography.fontFamily.mono, textAlign: "center", padding: 0, letterSpacing: 4 },
  switchMode: { marginTop: 16, alignItems: "center" },
  switchModeText: { fontSize: 13, fontFamily: typography.fontFamily.body },
  error: { fontSize: 14, textAlign: "center", marginTop: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 14, fontFamily: typography.fontFamily.body },
  debugLink: { marginTop: 28, alignItems: "center", paddingVertical: 8 },
  debugLinkText: { fontSize: 11, fontFamily: typography.fontFamily.body, textDecorationLine: "underline" },
});
