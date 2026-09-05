import { useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Linking, Switch, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  User, BellRing, RefreshCw, LogOut, Moon, Sun, Monitor,
  Shield, Info, Mail, Globe, FileText,
  Smartphone, CheckCircle, Zap, Star, Crown, Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import { registerExpoToken, getUserSettings, updateUserSettings, getPlanInfo, type PlanInfo } from "@/lib/api";
import { registerForPushNotifications, sendTestNotification } from "@/lib/notifications";

const APP_VERSION = "1.0.0";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  business: "Business",
};

function formatCurrency(amount: number, currency: "fcfa" | "usd"): string {
  if (currency === "fcfa") {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  }
  return `${amount.toLocaleString("en-US")} USD`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const { colors, mode, setMode } = useTheme();
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ["planInfo"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée.");
      return getPlanInfo(token);
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const settings = await getUserSettings(token);
        setWhatsappNumber(settings.whatsappNumber ?? "");
        setNotificationEmail(settings.notificationEmail ?? "");
        setPushEnabled(settings.pushEnabled ?? false);
      } catch {
        // silencieux
      } finally {
        setSettingsLoaded(true);
      }
    })();
  }, []);

  async function handleSaveReception() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expirée.");
      await updateUserSettings(token, {
        whatsappNumber: whatsappNumber || undefined,
        notificationEmail: notificationEmail || undefined,
      });
      setSaveMessage("Paramètres de réception enregistrés.");
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestNotification() {
    await sendTestNotification();
  }

  async function handleReactivatePush() {
    setPushStatus("Activation en cours...");
    try {
      const token = await registerForPushNotifications(async (expoPushToken, platform) => {
        const sessionToken = await getToken();
        if (!sessionToken) throw new Error("Session expirée.");
        await registerExpoToken(sessionToken, expoPushToken, platform);
      });
      if (token) {
        setPushEnabled(true);
        setPushStatus("Notifications activées");
      } else {
        setPushStatus("Impossible d'activer (permission refusée).");
      }
    } catch (err) {
      setPushStatus(err instanceof Error ? err.message : "Erreur lors de l'activation.");
    }
  }

  async function handleTogglePush(value: boolean) {
    setPushEnabled(value);
    try {
      const token = await getToken();
      if (!token) return;
      await updateUserSettings(token, { pushEnabled: value });
    } catch {
      setPushEnabled(!value);
    }
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  function planName(p: string): string {
    return PLAN_LABELS[p] ?? p;
  }

  function usagePercent(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min((used / limit) * 100, 100);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.bone }]}>Paramètres</Text>

        {/* Section: Compte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Compte</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <View style={styles.row}>
              <User size={22} color={colors.signal} />
              <Text style={[styles.rowText, { color: colors.bone }]}>{email || "Compte Kamforms"}</Text>
            </View>
          </View>
        </View>

        {/* Section: Reception */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Reception</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Smartphone size={16} color={colors.textMuted} />
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Numero WhatsApp</Text>
              </View>
              <TextInput
                style={[{ borderColor: colors.line, color: colors.bone, backgroundColor: colors.graphiteSoft }, styles.textInput]}
                placeholder="+221 77 123 45 67"
                placeholderTextColor={colors.textFaint}
                value={whatsappNumber}
                onChangeText={setWhatsappNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
            <View style={[{ backgroundColor: colors.line }, styles.separator]} />
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Mail size={16} color={colors.textMuted} />
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Email de notification</Text>
              </View>
              <TextInput
                style={[{ borderColor: colors.line, color: colors.bone, backgroundColor: colors.graphiteSoft }, styles.textInput]}
                placeholder="exemple@email.com"
                placeholderTextColor={colors.textFaint}
                value={notificationEmail}
                onChangeText={setNotificationEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {saveMessage ? (
              <Text style={[styles.saveMessage, { color: saveMessage.includes("erreur") || saveMessage.includes("Erreur") ? colors.danger : colors.signal }]}>{saveMessage}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [{ borderColor: colors.signal, backgroundColor: colors.signalSoft }, styles.saveButton, pressed && { opacity: 0.7 }]}
              onPress={handleSaveReception}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.signal} />
              ) : (
                <>
                  <CheckCircle size={16} color={colors.signal} />
                  <Text style={[styles.saveButtonText, { color: colors.signal }]}>Enregistrer</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Section: Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Notifications</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <View style={styles.row}>
              <BellRing size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone, flex: 1 }]}>Notifications push</Text>
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePush}
                trackColor={{ false: colors.line, true: colors.signalSoft }}
                thumbColor={pushEnabled ? colors.signal : colors.textFaint}
              />
            </View>
            <View style={[{ backgroundColor: colors.line }, styles.separator]} />
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={handleTestNotification}>
              <BellRing size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Tester le son + vibration</Text>
            </Pressable>
            <View style={[{ backgroundColor: colors.line }, styles.separator]} />
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={handleReactivatePush}>
              <RefreshCw size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Reactiver les notifications</Text>
            </Pressable>
          </View>
          {pushStatus ? <Text style={[styles.status, { color: colors.textMuted }]}>{pushStatus}</Text> : null}
        </View>

        {/* Section: Theme */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Theme</Text>
          <View style={styles.themeRow}>
            <Pressable
              style={({ pressed }) => [{ borderColor: mode === "system" ? colors.signal : colors.line, backgroundColor: colors.graphite }, styles.themeOption, pressed && { opacity: 0.8 }]}
              onPress={() => setMode("system")}
            >
              <Monitor size={22} color={mode === "system" ? colors.signal : colors.textMuted} />
              <Text style={[{ color: mode === "system" ? colors.signal : colors.textMuted }, styles.themeOptionLabel]}>Auto</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ borderColor: mode === "light" ? colors.signal : colors.line, backgroundColor: colors.graphite }, styles.themeOption, pressed && { opacity: 0.8 }]}
              onPress={() => setMode("light")}
            >
              <Sun size={22} color={mode === "light" ? colors.signal : colors.textMuted} />
              <Text style={[{ color: mode === "light" ? colors.signal : colors.textMuted }, styles.themeOptionLabel]}>Clair</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ borderColor: mode === "dark" ? colors.signal : colors.line, backgroundColor: colors.graphite }, styles.themeOption, pressed && { opacity: 0.8 }]}
              onPress={() => setMode("dark")}
            >
              <Moon size={22} color={mode === "dark" ? colors.signal : colors.textMuted} />
              <Text style={[{ color: mode === "dark" ? colors.signal : colors.textMuted }, styles.themeOptionLabel]}>Sombre</Text>
            </Pressable>
          </View>
        </View>

        {/* Section: Plan & Utilisation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Plan & Utilisation</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            {planLoading ? (
              <View style={styles.planLoading}>
                <ActivityIndicator size="small" color={colors.textMuted} />
                <Text style={[styles.planLoadingText, { color: colors.textMuted }]}>Chargement des informations...</Text>
              </View>
            ) : planData ? (
              <>
                <View style={styles.planHeaderRow}>
                  <Crown size={20} color={planData.plan === "business" ? colors.spark : planData.plan === "pro" ? colors.signal : colors.textMuted} />
                  <View>
                    <Text style={[styles.planName, { color: colors.bone }]}>Plan {planName(planData.plan)}</Text>
                    <Text style={[styles.planStatus, { color: planData.status === "active" ? colors.signal : colors.danger }]}>
                      {planData.status === "active" ? "Actif" : planData.status === "expired" ? "Expire" : "Annule"}
                      {planData.period === "annual" ? " (annuel)" : " (mensuel)"}
                    </Text>
                  </View>
                </View>
                <View style={styles.usageSection}>
                  <UsageBar
                    label="Formulaires"
                    used={planData.usage.forms.used}
                    limit={planData.usage.forms.limit}
                    colors={colors}
                    icon={<FileText size={14} color={colors.textMuted} />}
                  />
                  <UsageBar
                    label="Notifications"
                    used={planData.usage.notifications.used}
                    limit={planData.usage.notifications.limit}
                    colors={colors}
                    icon={<BellRing size={14} color={colors.textMuted} />}
                  />
                  <UsageBar
                    label="Collaborateurs"
                    used={planData.usage.collaborators.used}
                    limit={planData.usage.collaborators.limit}
                    colors={colors}
                    icon={<User size={14} color={colors.textMuted} />}
                  />
                </View>
              </>
            ) : (
              <View style={styles.planLoading}>
                <Text style={[styles.planLoadingText, { color: colors.textMuted }]}>Impossible de charger les informations du plan.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section: Offres */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Offres</Text>
          {/* Carte Pro */}
          <View style={[{ borderColor: colors.signal, backgroundColor: colors.graphite }, styles.planCard]}>
            <View style={styles.planCardHeader}>
              <Zap size={22} color={colors.signal} />
              <View>
                <Text style={[styles.planCardName, { color: colors.bone }]}>Pro</Text>
                <Text style={[styles.planCardSub, { color: colors.textMuted }]}>Pour les createurs et freelances</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, { color: colors.bone }]}>{formatCurrency(4900, "fcfa")}</Text>
              <Text style={[styles.pricePeriod, { color: colors.textMuted }]}> / mois</Text>
            </View>
            <Text style={[styles.priceAnnual, { color: colors.textFaint }]}>ou {formatCurrency(49000, "fcfa")}/an</Text>
            <Text style={[styles.priceUsd, { color: colors.textFaint }]}>~{formatCurrency(8, "usd")} / mois, ~{formatCurrency(80, "usd")}/an</Text>
            <View style={styles.featureList}>
              <FeatureRow text="Formulaires illimites" colors={colors} />
              <FeatureRow text="Notifications en temps reel" colors={colors} />
              <FeatureRow text="Analytiques avancees" colors={colors} />
              <FeatureRow text="Jusqu'a 3 collaborateurs" colors={colors} />
              <FeatureRow text="Personnalisation avancee" colors={colors} />
              <FeatureRow text="Support prioritaire" colors={colors} />
            </View>
          </View>
          {/* Carte Business */}
          <View style={[{ borderColor: colors.spark, backgroundColor: colors.graphite }, styles.planCard, styles.planCardSpaced]}>
            <View style={styles.planCardHeader}>
              <Star size={22} color={colors.spark} />
              <View>
                <Text style={[styles.planCardName, { color: colors.bone }]}>Business</Text>
                <Text style={[styles.planCardSub, { color: colors.textMuted }]}>Pour les equipes et entreprises</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, { color: colors.bone }]}>{formatCurrency(14900, "fcfa")}</Text>
              <Text style={[styles.pricePeriod, { color: colors.textMuted }]}> / mois</Text>
            </View>
            <Text style={[styles.priceAnnual, { color: colors.textFaint }]}>ou {formatCurrency(149000, "fcfa")}/an</Text>
            <Text style={[styles.priceUsd, { color: colors.textFaint }]}>~{formatCurrency(24, "usd")} / mois, ~{formatCurrency(240, "usd")}/an</Text>
            <View style={styles.featureList}>
              <FeatureRow text="Tout ce qui est inclus dans Pro" colors={colors} />
              <FeatureRow text="Collaborateurs illimites" colors={colors} />
              <FeatureRow text="API & Webhooks" colors={colors} />
              <FeatureRow text="Chiffrement de bout en bout" colors={colors} />
              <FeatureRow text="Assistance dediee" colors={colors} />
              <FeatureRow text="SLA garanti" colors={colors} />
            </View>
          </View>
        </View>

        {/* Section: Confidentialite */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Confidentialite</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={() => Linking.openURL("https://kamforms.com/confidentialite")}>
              <Shield size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Politique de confidentialite</Text>
            </Pressable>
            <View style={[{ backgroundColor: colors.line }, styles.separator]} />
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={() => Linking.openURL("https://kamforms.com/conditions")}>
              <FileText size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Conditions d'utilisation</Text>
            </Pressable>
          </View>
        </View>

        {/* Section: Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={() => Linking.openURL("mailto:hello@kamforms.com")}>
              <Mail size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Nous contacter</Text>
            </Pressable>
            <View style={[{ backgroundColor: colors.line }, styles.separator]} />
            <Pressable style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]} onPress={() => Linking.openURL("https://kamforms.com")}>
              <Globe size={18} color={colors.bone} />
              <Text style={[styles.actionText, { color: colors.bone }]}>Site web</Text>
            </Pressable>
          </View>
        </View>

        {/* Section: A propos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>A propos</Text>
          <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
            <View style={styles.row}>
              <Info size={18} color={colors.textMuted} />
              <Text style={[styles.rowTextSmall, { color: colors.textMuted }]}>Version {APP_VERSION}</Text>
            </View>
          </View>
        </View>

        {/* Section: Deconnexion */}
        <View style={styles.section}>
          <Pressable style={({ pressed }) => [styles.destructiveBtn, pressed && { opacity: 0.7 }]} onPress={() => signOut()}>
            <LogOut size={18} color={colors.danger} />
            <Text style={[styles.destructiveText, { color: colors.danger }]}>Se deconnecter</Text>
          </Pressable>
        </View>

        {/* Section: Suppression de compte (règle Apple App Store 5.1.1v7) */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.destructiveBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push("/parametres-supprimer-compte" as never)}
          >
            <Trash2 size={18} color={colors.danger} />
            <Text style={[styles.destructiveText, { color: colors.danger }]}>Supprimer mon compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── Sous-composants ──────────────────────────────── */

function UsageBar({ label, used, limit, colors, icon }: {
  label: string;
  used: number;
  limit: number;
  colors: any;
  icon: React.ReactNode;
}) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageHeader}>
        <View style={styles.usageLabelRow}>
          {icon}
          <Text style={[styles.usageLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
        <Text style={[styles.usageCount, { color: colors.bone }]}>
          {used}{limit > 0 ? ` / ${limit}` : ""}
        </Text>
      </View>
      <View style={[{ backgroundColor: colors.line }, styles.usageBarBg]}>
        <View style={[{ width: `${pct}%`, backgroundColor: pct >= 80 ? colors.danger : colors.signal }, styles.usageBarFill]} />
      </View>
    </View>
  );
}

function FeatureRow({ text, colors }: { text: string; colors: any }) {
  return (
    <View style={styles.featureRow}>
      <CheckCircle size={14} color={colors.signal} />
      <Text style={[styles.featureText, { color: colors.bone }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: "700", fontFamily: typography.fontFamily.display, marginVertical: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: "700", fontFamily: typography.fontFamily.displaySemibold, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 },
  card: { borderWidth: 1, borderRadius: radius.sm, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  rowText: { fontSize: 15, fontFamily: typography.fontFamily.body },
  rowTextSmall: { fontSize: 13, fontFamily: typography.fontFamily.body },
  themeRow: { flexDirection: "row", gap: 10 },
  themeOption: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderRadius: radius.sm, paddingVertical: 14, paddingHorizontal: 8 },
  themeOptionLabel: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium, marginTop: 2 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  actionText: { fontSize: 15, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  separator: { height: 1, marginHorizontal: 14 },
  status: { fontSize: 13, fontFamily: typography.fontFamily.body, marginTop: 8 },
  destructiveBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, justifyContent: "center" },
  destructiveText: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.bodyMedium },

  // Reception
  inputGroup: { padding: 14 },
  inputLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  textInput: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: typography.fontFamily.body },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginHorizontal: 14, marginBottom: 14, paddingVertical: 10, borderRadius: radius.sm, borderWidth: 1 },
  saveButtonText: { fontSize: 14, fontWeight: "600", fontFamily: typography.fontFamily.bodyMedium },
  saveMessage: { fontSize: 13, fontFamily: typography.fontFamily.body, textAlign: "center", marginBottom: 10 },

  // Plan & Utilisation
  planLoading: { padding: 20, alignItems: "center", gap: 8 },
  planLoadingText: { fontSize: 13, fontFamily: typography.fontFamily.body, textAlign: "center" },
  planHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  planName: { fontSize: 17, fontWeight: "700", fontFamily: typography.fontFamily.display },
  planStatus: { fontSize: 12, fontWeight: "600", fontFamily: typography.fontFamily.bodyMedium, marginTop: 2 },
  usageSection: { paddingHorizontal: 14, paddingBottom: 14, gap: 14 },
  usageRow: { gap: 6 },
  usageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  usageLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  usageLabel: { fontSize: 12, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  usageCount: { fontSize: 12, fontWeight: "600", fontFamily: typography.fontFamily.mono },
  usageBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  usageBarFill: { height: 6, borderRadius: 3 },

  // Offres
  planCard: { borderWidth: 1, borderRadius: radius.md, padding: 16 },
  planCardSpaced: { marginTop: 14 },
  planCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  planCardName: { fontSize: 18, fontWeight: "700", fontFamily: typography.fontFamily.display },
  planCardSub: { fontSize: 12, fontWeight: "400", fontFamily: typography.fontFamily.body, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "baseline" },
  priceAmount: { fontSize: 24, fontWeight: "700", fontFamily: typography.fontFamily.display },
  pricePeriod: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium },
  priceAnnual: { fontSize: 12, fontFamily: typography.fontFamily.body, marginTop: 2 },
  priceUsd: { fontSize: 11, fontFamily: typography.fontFamily.body, marginTop: 1 },
  featureList: { marginTop: 14, gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: typography.fontFamily.body },
});
