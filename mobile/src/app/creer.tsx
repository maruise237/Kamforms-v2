import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Sparkles,
  CheckCircle2,
  Mail,
  Banknote,
  Star,
  Briefcase,
  CalendarCheck,
  Send,
  Target,
  MessageSquare,
  CalendarDays,
  FileUp,
  Loader,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  createForm,
  formPublicUrl,
  generateForm,
  importGoogleForms,
  FORM_TEMPLATES,
  type Template,
} from "@/lib/api";
import TopBack from "@/components/ui/TopBack";

type Mode = "ia" | "templates" | "importer";
type FormType = "single" | "multi";

const MODES: { key: Mode; label: string }[] = [
  { key: "ia", label: "IA" },
  { key: "templates", label: "Modeles" },
  { key: "importer", label: "Importer" },
];

const FORM_TYPE_OPTIONS: { key: FormType; label: string }[] = [
  { key: "single", label: "Page unique" },
  { key: "multi", label: "Multi-etapes" },
];

const EXAMPLES = [
  "Un formulaire de commande pour ma boutique de vetements avec nom, telephone WhatsApp, taille et quantite",
  "Une inscription a un evenement avec nom, email, nombre de places et choix de date",
  "Un formulaire de satisfaction client avec note sur 5 et commentaire libre",
];

const TEMPLATE_ICONS: Record<string, React.ComponentType<any>> = {
  Mail,
  Banknote,
  Star,
  Briefcase,
  CalendarCheck,
  Send,
  Target,
  MessageSquare,
  CalendarDays,
};

export default function CreateScreen() {
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mode
  const [mode, setMode] = useState<Mode>("ia");

  // Shared
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ title: string; url: string } | null>(null);
  const [formType, setFormType] = useState<FormType>("single");

  // Mode IA
  const [prompt, setPrompt] = useState("");

  // Mode Importer
  const [importUrl, setImportUrl] = useState("");

  // Mode Templates
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateFormType, setShowTemplateFormType] = useState(false);
  const [templateBusy, setTemplateBusy] = useState(false);

  function reset() {
    setError(null);
    setCreated(null);
  }

  function switchMode(next: Mode) {
    reset();
    setMode(next);
    setPrompt("");
    setImportUrl("");
    setSelectedTemplate(null);
    setShowTemplateFormType(false);
    setTemplateBusy(false);
    setFormType("single");
    setBusy(false);
  }

  // ─── IA Generate ────────────────────────────────────────────

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      const generated = await generateForm(token, trimmed, formType);
      const title =
        typeof generated.schema?.title === "string" && generated.schema.title.length > 0
          ? generated.schema.title
          : trimmed.slice(0, 60);
      const form = await createForm(token, {
        title,
        schema: generated.schema,
        ...(generated.ending ? { ending: generated.ending } : {}),
      });
      setCreated({ title, url: formPublicUrl(form.slug) });
      setPrompt("");
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "La generation a echoue. Reessayez.");
    } finally {
      setBusy(false);
    }
  }

  // ─── Template Create ──────────────────────────────────────

  function handleSelectTemplate(tpl: Template) {
    setSelectedTemplate(tpl);
    setShowTemplateFormType(true);
    setError(null);
  }

  async function handleCreateFromTemplate() {
    if (!selectedTemplate || templateBusy) return;
    setTemplateBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      const form = await createForm(token, {
        title: selectedTemplate.name,
        schema: { fields: selectedTemplate.fields },
      });
      setCreated({ title: selectedTemplate.name, url: formPublicUrl(form.slug) });
      setSelectedTemplate(null);
      setShowTemplateFormType(false);
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "La creation a echoue. Reessayez.");
    } finally {
      setTemplateBusy(false);
    }
  }

  // ─── Import ────────────────────────────────────────────────

  async function handleImport() {
    const trimmed = importUrl.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    setCreated(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      if (!trimmed.includes("docs.google.com/forms")) {
        throw new Error("Lien invalide. Veuillez fournir une URL Google Forms publique.");
      }
      const generated = await importGoogleForms(token, trimmed, formType);
      const title =
        typeof generated.schema?.title === "string" && generated.schema.title.length > 0
          ? generated.schema.title
          : "Formulaire importe";
      const form = await createForm(token, {
        title,
        schema: generated.schema,
        ...(generated.ending ? { ending: generated.ending } : {}),
      });
      setCreated({ title, url: formPublicUrl(form.slug) });
      setImportUrl("");
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'import a echoue. Reessayez.");
    } finally {
      setBusy(false);
    }
  }

  // ─── Share ──────────────────────────────────────────────────

  function handleShare() {
    if (!created) return;
    Share.share({ message: "Repondez a mon formulaire : " + created.url });
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TopBack onPress={() => router.back()} />

          <Text style={[styles.heading, { color: colors.bone }]}>
            Creer un formulaire
          </Text>

          {/* ── Mode Tabs ── */}
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.key;
              return (
                <Pressable
                  key={m.key}
                  style={[
                    styles.modeTab,
                    {
                      backgroundColor: active ? colors.signal : colors.graphite,
                      borderColor: active ? colors.signal : colors.line,
                    },
                  ]}
                  onPress={() => switchMode(m.key)}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      { color: active ? colors.bone : colors.textMuted },
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Success Banner ── */}
          {created ? (
            <View
              style={[
                styles.success,
                { borderColor: colors.signalSoft, backgroundColor: colors.graphite },
              ]}
            >
              <CheckCircle2 size={28} color={colors.signal} />
              <Text style={[styles.successTitle, { color: colors.signal }]}>
                "{created.title}" est en ligne !
              </Text>
              <Text style={[styles.successUrl, { color: colors.signal }]}>
                {created.url}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  { borderColor: colors.line },
                  styles.shareBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleShare}
              >
                <Text style={[styles.shareBtnText, { color: colors.bone }]}>
                  Partager le lien
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* ── Error ── */}
          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}

          {/* ════════════════════════════════════════════════════
             MODE 1 : IA
          ════════════════════════════════════════════════════ */}
          {mode === "ia" && !created ? (
            <View>
              {/* Prompt */}
              <View
                style={[
                  { borderColor: colors.line, backgroundColor: colors.graphite },
                  styles.inputCard,
                ]}
              >
                <TextInput
                  style={{ color: colors.bone, ...styles.input }}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="Decrivez votre formulaire en une phrase"
                  placeholderTextColor={colors.textFaint}
                  multiline
                  numberOfLines={4}
                  maxLength={2000}
                  editable={!busy}
                />
              </View>

              {/* Form type chips */}
              <View style={styles.formTypeRow}>
                {FORM_TYPE_OPTIONS.map((opt) => {
                  const active = formType === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[
                        styles.formTypeChip,
                        {
                          backgroundColor: active ? colors.bone : colors.graphite,
                          borderColor: active ? colors.bone : colors.line,
                        },
                      ]}
                      onPress={() => setFormType(opt.key)}
                    >
                      <Text
                        style={[
                          styles.formTypeChipText,
                          { color: active ? colors.ink : colors.textMuted },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Generate button */}
              <Pressable
                style={({ pressed }) => [
                  { backgroundColor: colors.signal },
                  styles.button,
                  (!prompt.trim() || busy) && { opacity: 0.4 },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleGenerate}
                disabled={!prompt.trim() || busy}
              >
                {busy ? (
                  <>
                    <ActivityIndicator color={colors.bone} />
                    <Text style={[styles.buttonText, { color: colors.bone }]}>
                      Generation en cours...
                    </Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} color={colors.bone} />
                    <Text style={[styles.buttonText, { color: colors.bone }]}>
                      Generer avec l'IA
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Examples */}
              <View style={styles.examples}>
                <Text style={[styles.examplesTitle, { color: colors.textMuted }]}>
                  Exemples
                </Text>
                {EXAMPLES.map((example) => (
                  <Pressable
                    key={example}
                    style={[
                      { borderColor: colors.line, backgroundColor: colors.graphite },
                      styles.example,
                    ]}
                    onPress={() => setPrompt(example)}
                  >
                    <Text style={[styles.exampleText, { color: colors.textMuted }]}>
                      {example}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {/* ════════════════════════════════════════════════════
             MODE 2 : TEMPLATES
          ════════════════════════════════════════════════════ */}
          {mode === "templates" && !created ? (
            <View>
              {/* Template form type selector overlay */}
              {showTemplateFormType && selectedTemplate ? (
                <View
                  style={[
                    styles.templateTypeOverlay,
                    { borderColor: colors.line, backgroundColor: colors.graphite },
                  ]}
                >
                  <Text style={[styles.templateTypeTitle, { color: colors.bone }]}>
                    {selectedTemplate.name}
                  </Text>
                  <Text style={[styles.templateTypeDesc, { color: colors.textMuted }]}>
                    Choisissez le type de formulaire
                  </Text>
                  <View style={styles.formTypeRow}>
                    {FORM_TYPE_OPTIONS.map((opt) => {
                      const active = formType === opt.key;
                      return (
                        <Pressable
                          key={opt.key}
                          style={[
                            styles.formTypeChip,
                            {
                              backgroundColor: active ? colors.bone : colors.graphite,
                              borderColor: active ? colors.bone : colors.line,
                            },
                          ]}
                          onPress={() => setFormType(opt.key)}
                        >
                          <Text
                            style={[
                              styles.formTypeChipText,
                              { color: active ? colors.ink : colors.textMuted },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.templateTypeActions}>
                    <Pressable
                      style={({ pressed }) => [
                        { borderColor: colors.line },
                        styles.templateCancelBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => {
                        setSelectedTemplate(null);
                        setShowTemplateFormType(false);
                      }}
                    >
                      <Text
                        style={[styles.templateCancelText, { color: colors.textMuted }]}
                      >
                        Annuler
                      </Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        { backgroundColor: colors.signal },
                        styles.templateConfirmBtn,
                        templateBusy && { opacity: 0.4 },
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={handleCreateFromTemplate}
                      disabled={templateBusy}
                    >
                      {templateBusy ? (
                        <ActivityIndicator color={colors.bone} size="small" />
                      ) : (
                        <Text style={[styles.templateConfirmText, { color: colors.bone }]}>
                          Creer
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* Template grid */}
              <View style={styles.templateGrid}>
                {FORM_TEMPLATES.map((tpl) => {
                  const IconComponent = TEMPLATE_ICONS[tpl.icon];
                  return (
                    <Pressable
                      key={tpl.id}
                      style={({ pressed }) => [
                        {
                          borderColor: colors.line,
                          backgroundColor: colors.graphite,
                        },
                        styles.templateCard,
                        pressed && { opacity: 0.8 },
                      ]}
                      onPress={() => handleSelectTemplate(tpl)}
                    >
                      <View
                        style={[
                          styles.templateIconWrap,
                          { backgroundColor: colors.graphiteSoft },
                        ]}
                      >
                        {IconComponent ? (
                          <IconComponent size={22} color={colors.signal} />
                        ) : (
                          <Mail size={22} color={colors.signal} />
                        )}
                      </View>
                      <Text
                        style={[styles.templateName, { color: colors.bone }]}
                        numberOfLines={1}
                      >
                        {tpl.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* ════════════════════════════════════════════════════
             MODE 3 : IMPORTER
          ════════════════════════════════════════════════════ */}
          {mode === "importer" && !created ? (
            <View>
              <Text style={[styles.importSubtitle, { color: colors.textMuted }]}>
                Importez un formulaire Google Forms existant a partir de son lien public.
              </Text>

              {/* URL input */}
              <View
                style={[
                  { borderColor: colors.line, backgroundColor: colors.graphite },
                  styles.inputCard,
                ]}
              >
                <TextInput
                  style={{ color: colors.bone, ...styles.input }}
                  value={importUrl}
                  onChangeText={setImportUrl}
                  placeholder="URL publique Google Forms"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!busy}
                />
              </View>

              {/* Form type chips */}
              <View style={styles.formTypeRow}>
                {FORM_TYPE_OPTIONS.map((opt) => {
                  const active = formType === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      style={[
                        styles.formTypeChip,
                        {
                          backgroundColor: active ? colors.bone : colors.graphite,
                          borderColor: active ? colors.bone : colors.line,
                        },
                      ]}
                      onPress={() => setFormType(opt.key)}
                    >
                      <Text
                        style={[
                          styles.formTypeChipText,
                          { color: active ? colors.ink : colors.textMuted },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Import button */}
              <Pressable
                style={({ pressed }) => [
                  { backgroundColor: colors.signal },
                  styles.button,
                  (!importUrl.trim() || busy) && { opacity: 0.4 },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleImport}
                disabled={!importUrl.trim() || busy}
              >
                {busy ? (
                  <>
                    <ActivityIndicator color={colors.bone} />
                    <Text style={[styles.buttonText, { color: colors.bone }]}>
                      Import en cours...
                    </Text>
                  </>
                ) : (
                  <>
                    <FileUp size={16} color={colors.bone} />
                    <Text style={[styles.buttonText, { color: colors.bone }]}>
                      Importer
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // ── Heading ──
  heading: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
    marginTop: 16,
    marginBottom: 16,
  },

  // ── Mode Tabs ──
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
  },

  // ── Shared Input ──
  inputCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
  },
  input: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    minHeight: 110,
    textAlignVertical: "top",
    padding: 0,
  },

  // ── Form Type Chips ──
  formTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  formTypeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  formTypeChipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── Button ──
  button: {
    flexDirection: "row",
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
  },

  // ── Error ──
  errorText: {
    fontSize: 14,
    marginTop: 14,
    fontFamily: typography.fontFamily.body,
  },

  // ── Success ──
  success: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
    textAlign: "center",
  },
  successUrl: {
    fontSize: 13,
    fontFamily: typography.fontFamily.mono,
    textAlign: "center",
  },
  shareBtn: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 6,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── IA: Examples ──
  examples: { marginTop: 28 },
  examplesTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: typography.fontFamily.displaySemibold,
    marginBottom: 10,
  },
  example: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    lineHeight: 18,
  },

  // ── Templates Grid ──
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  templateCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  templateIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  templateName: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
    textAlign: "center",
  },

  // ── Template Type Selector Overlay ──
  templateTypeOverlay: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
    gap: 8,
  },
  templateTypeTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
  },
  templateTypeDesc: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  templateTypeActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  templateCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templateCancelText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  templateConfirmBtn: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templateConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
  },

  // ── Importer ──
  importSubtitle: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    marginBottom: 16,
    lineHeight: 20,
  },
});
