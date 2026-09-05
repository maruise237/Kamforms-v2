import { useState, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Check,
  ClipboardCopy,
  Copy,
  Eye,
  Globe,
  ImagePlus,
  Link,
  MapPin,
  MessageSquare,
  Paintbrush,
  PartyPopper,
  RefreshCw,
  Save,
  Send,
  Share2,
  Sliders,
  ToggleLeft,
  TrendingUp,
  Users,
  X,
} from "lucide-react-native";
import { typography, radius, spacing } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  getForm,
  updateForm,
  deleteForm,
  cloneForm,
  getFormAnalytics,
  formPublicUrl,
  type FormDetail,
  type FormTheme,
  type FormEnding,
} from "@/lib/api";
import TopBack from "@/components/ui/TopBack";

// ─── Types ─────────────────────────────────────────────────

type ActiveTab =
  | "apercu"
  | "apparence"
  | "fin"
  | "parametres"
  | "statistiques";

const TABS: { key: ActiveTab; label: string; icon: any }[] = [
  { key: "apercu", label: "Apercu", icon: Eye },
  { key: "apparence", label: "Apparence", icon: Paintbrush },
  { key: "fin", label: "Fin", icon: MessageSquare },
  { key: "parametres", label: "Parametres", icon: Sliders },
  { key: "statistiques", label: "Statistiques", icon: TrendingUp },
];

const COLOR_PRESETS = [
  { name: "Zinc", value: "#71717A" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose", value: "#E11D48" },
  { name: "Emerald", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Ocean", value: "#0891B2" },
] as const;

const BG_PRESETS_LIGHT = [
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#F3F4F6" },
  { name: "Cream", value: "#FEF3C7" },
  { name: "Rose", value: "#FFE4E6" },
  { name: "Azur", value: "#E0F2FE" },
  { name: "Mint", value: "#D1FAE5" },
] as const;

const BG_PRESETS_DARK = [
  { name: "Black", value: "#09090B" },
  { name: "Charcoal", value: "#1C1917" },
  { name: "Indigo Night", value: "#1E1B4B" },
  { name: "Forest", value: "#022C22" },
] as const;

const NOTIFICATION_FREQ: { key: FormDetail["notificationMode"]; label: string }[] = [
  { key: "every", label: "Chaque reponse" },
  { key: "milestones", label: "Etapes cles" },
  { key: "first_only", label: "Premiere seulement" },
  { key: "daily_digest", label: "Resume quotidien" },
  { key: "off", label: "Desactive" },
];

// ─── Helper ─────────────────────────────────────────────────

function fieldTypeLabel(type: string): string {
  const map: Record<string, string> = {
    text: "Texte court",
    email: "Email",
    phone: "Telephone",
    number: "Nombre",
    textarea: "Texte long",
    select: "Liste deroulante",
    radio: "Choix unique",
    checkbox: "Choix multiples",
    date: "Date",
    rating: "Evaluation",
  };
  return map[type] ?? type;
}

// ─── Main Screen ────────────────────────────────────────────

export default function FormDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("apercu");

  // ── Form query ──
  const {
    data: form,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["form", id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      return getForm(token, id);
    },
    enabled: !!id,
  });

  // ── Analytics query ──
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["form-analytics", id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      return getFormAnalytics(token, id);
    },
    enabled: !!id && activeTab === "statistiques",
  });

  // ── Update mutation ──
  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<FormDetail>) => {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      return updateForm(token, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["form", id] });
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (err: Error) => {
      Alert.alert("Erreur", err.message);
    },
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      return deleteForm(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.back();
    },
    onError: (err: Error) => {
      Alert.alert("Erreur", err.message);
    },
  });

  // ── Clone mutation ──
  const cloneMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expiree. Reconnectez-vous.");
      return cloneForm(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
      Alert.alert("Duplication reussie", "Le formulaire a ete duplique avec succes.");
    },
    onError: (err: Error) => {
      Alert.alert("Erreur", err.message);
    },
  });

  // ── Local state for editable fields ──

  // Apercu
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [slug, setSlug] = useState("");

  // Apparence
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(
    undefined
  );
  const [customColor, setCustomColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerPosition, setBannerPosition] = useState<
    "top" | "center" | "bottom"
  >("top");

  // Fin
  const [endingMessage, setEndingMessage] = useState("Reponse enregistree");
  const [endingDescription, setEndingDescription] = useState("");
  const [redirectEnabled, setRedirectEnabled] = useState(false);
  const [redirectButtonLabel, setRedirectButtonLabel] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [confettiEnabled, setConfettiEnabled] = useState(false);

  // Parametres
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMode, setNotificationMode] =
    useState<FormDetail["notificationMode"]>("off");
  const [assignedWhatsapp, setAssignedWhatsapp] = useState("");
  const [maxSubmissions, setMaxSubmissions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // ── Sync local state when form loads ──
  useMemo(() => {
    if (!form) return;
    setTitle(form.title);
    setDescription(form.description ?? "");
    setActive(form.active);
    setSlug(form.slug);
    setSelectedPreset(form.theme?.preset ?? undefined);
    setCustomColor(form.theme?.customColor ?? "");
    setBgColor(form.theme?.bgColor ?? "");
    setBannerUrl(form.theme?.bannerUrl ?? "");
    setBannerPosition(form.theme?.bannerPosition ?? "top");
    setEndingMessage(form.ending?.message ?? "Reponse enregistree");
    setEndingDescription(form.ending?.description ?? "");
    setRedirectButtonLabel(form.ending?.buttonLabel ?? "");
    setRedirectUrl(form.ending?.buttonUrl ?? "");
    setConfettiEnabled(form.ending?.confetti ?? false);
    setNotificationsEnabled(form.notificationsEnabled);
    setNotificationMode(form.notificationMode);
    setAssignedWhatsapp(form.assignedWhatsapp ?? "");
    setMaxSubmissions(
      form.maxSubmissions !== null ? String(form.maxSubmissions) : ""
    );
    setExpiresAt(form.expiresAt ?? "");
  }, [form]);

  // ── Derived ──
  const publicUrl = form ? formPublicUrl(form.slug) : "";

  // ── Save handlers ──

  const handleSaveApercu = useCallback(() => {
    updateMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      active,
      slug: slug.trim(),
    } as Partial<FormDetail>);
  }, [title, description, active, slug, updateMutation]);

  const handleSaveApparence = useCallback(() => {
    const theme: FormTheme = {
      preset: selectedPreset,
      customColor: customColor || undefined,
      bgColor: bgColor || undefined,
      bannerUrl: bannerUrl || undefined,
      bannerPosition,
    };
    updateMutation.mutate({ theme } as Partial<FormDetail>);
  }, [
    selectedPreset,
    customColor,
    bgColor,
    bannerUrl,
    bannerPosition,
    updateMutation,
  ]);

  const handleSaveFin = useCallback(() => {
    const ending: FormEnding = {
      message: endingMessage.trim() || "Reponse enregistree",
      description: endingDescription.trim() || undefined,
      buttonLabel: redirectEnabled ? redirectButtonLabel.trim() || undefined : undefined,
      buttonUrl: redirectEnabled ? redirectUrl.trim() || undefined : undefined,
      confetti: confettiEnabled,
    };
    updateMutation.mutate({ ending } as Partial<FormDetail>);
  }, [
    endingMessage,
    endingDescription,
    redirectEnabled,
    redirectButtonLabel,
    redirectUrl,
    confettiEnabled,
    updateMutation,
  ]);

  const handleSaveParametres = useCallback(() => {
    updateMutation.mutate({
      notificationsEnabled,
      notificationMode,
      assignedWhatsapp: assignedWhatsapp.trim() || null,
      maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
      expiresAt: expiresAt || null,
    } as Partial<FormDetail>);
  }, [
    notificationsEnabled,
    notificationMode,
    assignedWhatsapp,
    maxSubmissions,
    expiresAt,
    updateMutation,
  ]);

  // ── Actions ──

  const handleCopyLink = useCallback(() => {
    Alert.alert("Lien copie", publicUrl);
  }, [publicUrl]);

  const handleShareLink = useCallback(() => {
    if (!form) return;
    void Share.share({
      message: `Repondez a mon formulaire « ${form.title} » : ${publicUrl}`,
    });
  }, [form, publicUrl]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Supprimer le formulaire",
      "Cette action est irreversible. Toutes les reponses seront perdues.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  }, [deleteMutation]);

  const handleClone = useCallback(() => {
    cloneMutation.mutate();
  }, [cloneMutation]);

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.ink }]}
        edges={["top"]}
      >
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.textMuted} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Chargement du formulaire...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !form) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.ink }]}
        edges={["top"]}
      >
        <TopBack onPress={() => router.back()} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error instanceof Error
              ? error.message
              : "Impossible de charger le formulaire."}
          </Text>
          <Pressable
            style={({ pressed }) => [
              { borderColor: colors.line },
              styles.retryButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => refetch()}
          >
            <RefreshCw size={16} color={colors.textMuted} />
            <Text style={[styles.retryText, { color: colors.textMuted }]}>
              Reessayer
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.ink }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TopBack onPress={() => router.back()} />
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleClone}
              style={({ pressed }) => [
                styles.headerIconBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Copy size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.headerIconBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={18} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBarScroll}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={({ pressed }) => [
                  {
                    backgroundColor: isActive
                      ? colors.signal
                      : colors.graphite,
                    borderColor: isActive ? colors.signal : colors.line,
                  },
                  styles.tabPill,
                  pressed && !isActive && { opacity: 0.7 },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <TabIcon
                  size={14}
                  color={isActive ? colors.bone : colors.textMuted}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.bone : colors.textMuted,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tab content */}
        <ScrollView
          style={styles.tabContent}
          contentContainerStyle={styles.tabContentInner}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === "apercu" && (
            <TabApercu
              form={form}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              active={active}
              setActive={setActive}
              slug={slug}
              setSlug={setSlug}
              publicUrl={publicUrl}
              onCopyLink={handleCopyLink}
              onShareLink={handleShareLink}
              onSave={handleSaveApercu}
              isSaving={updateMutation.isPending}
              colors={colors}
            />
          )}
          {activeTab === "apparence" && (
            <TabApparence
              selectedPreset={selectedPreset}
              setSelectedPreset={setSelectedPreset}
              customColor={customColor}
              setCustomColor={setCustomColor}
              bgColor={bgColor}
              setBgColor={setBgColor}
              bannerUrl={bannerUrl}
              setBannerUrl={setBannerUrl}
              bannerPosition={bannerPosition}
              setBannerPosition={setBannerPosition}
              onSave={handleSaveApparence}
              isSaving={updateMutation.isPending}
              colors={colors}
            />
          )}
          {activeTab === "fin" && (
            <TabFin
              endingMessage={endingMessage}
              setEndingMessage={setEndingMessage}
              endingDescription={endingDescription}
              setEndingDescription={setEndingDescription}
              redirectEnabled={redirectEnabled}
              setRedirectEnabled={setRedirectEnabled}
              redirectButtonLabel={redirectButtonLabel}
              setRedirectButtonLabel={setRedirectButtonLabel}
              redirectUrl={redirectUrl}
              setRedirectUrl={setRedirectUrl}
              confettiEnabled={confettiEnabled}
              setConfettiEnabled={setConfettiEnabled}
              onSave={handleSaveFin}
              isSaving={updateMutation.isPending}
              colors={colors}
            />
          )}
          {activeTab === "parametres" && (
            <TabParametres
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={setNotificationsEnabled}
              notificationMode={notificationMode}
              setNotificationMode={setNotificationMode}
              assignedWhatsapp={assignedWhatsapp}
              setAssignedWhatsapp={setAssignedWhatsapp}
              maxSubmissions={maxSubmissions}
              setMaxSubmissions={setMaxSubmissions}
              expiresAt={expiresAt}
              setExpiresAt={setExpiresAt}
              onSave={handleSaveParametres}
              isSaving={updateMutation.isPending}
              colors={colors}
            />
          )}
          {activeTab === "statistiques" && (
            <TabStatistiques
              analytics={analytics ?? null}
              isLoading={analyticsLoading}
              onRefresh={refetchAnalytics}
              colors={colors}
              form={form}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 1 : Apercu
// ═══════════════════════════════════════════════════════════════

function TabApercu({
  form,
  title,
  setTitle,
  description,
  setDescription,
  active,
  setActive,
  slug,
  setSlug,
  publicUrl,
  onCopyLink,
  onShareLink,
  onSave,
  isSaving,
  colors,
}: {
  form: FormDetail;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  active: boolean;
  setActive: (v: boolean) => void;
  slug: string;
  setSlug: (v: string) => void;
  publicUrl: string;
  onCopyLink: () => void;
  onShareLink: () => void;
  onSave: () => void;
  isSaving: boolean;
  colors: any;
}) {
  return (
    <View>
      {/* Title */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Titre
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={title}
        onChangeText={setTitle}
        placeholder="Titre du formulaire"
        placeholderTextColor={colors.textFaint}
      />

      {/* Description */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Description
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
          styles.textArea,
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description optionnelle"
        placeholderTextColor={colors.textFaint}
        multiline
        numberOfLines={3}
      />

      {/* Active toggle */}
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.settingRow,
        ]}
      >
        <View style={styles.settingRowLeft}>
          <ToggleLeft size={20} color={colors.textMuted} />
          <Text style={[styles.settingRowLabel, { color: colors.bone }]}>
            {active ? "Actif" : "Inactif"}
          </Text>
        </View>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{ false: colors.line, true: colors.signalSoft }}
          thumbColor={active ? colors.signal : colors.textFaint}
        />
      </View>

      {/* Public link */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Lien public
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.linkDisplay,
        ]}
      >
        <Globe size={16} color={colors.textMuted} />
        <Text
          style={[styles.linkText, { color: colors.signal }]}
          numberOfLines={1}
        >
          {publicUrl}
        </Text>
      </View>
      <View style={styles.linkActions}>
        <Pressable
          style={({ pressed }) => [
            { borderColor: colors.line },
            styles.linkActionBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onCopyLink}
        >
          <ClipboardCopy size={16} color={colors.textMuted} />
          <Text style={[styles.linkActionText, { color: colors.textMuted }]}>
            Copier
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            { borderColor: colors.line },
            styles.linkActionBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onShareLink}
        >
          <Share2 size={16} color={colors.textMuted} />
          <Text style={[styles.linkActionText, { color: colors.textMuted }]}>
            Partager
          </Text>
        </Pressable>
      </View>

      {/* Slug editor */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Slug personnalise
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={slug}
        onChangeText={setSlug}
        placeholder="mon-slug-personnalise"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Form preview */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Apercu du formulaire
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.previewCard,
        ]}
      >
        {form.schema.steps && form.schema.steps.length > 0 && (
          <View style={styles.previewSteps}>
            <Text style={[styles.previewStepLabel, { color: colors.textFaint }]}>
              Etapes: {form.schema.steps.map((s) => s.title).join(" - ")}
            </Text>
          </View>
        )}
        {form.schema.fields.map((field, idx) => (
          <View key={field.id} style={styles.previewField}>
            <View style={styles.previewFieldDot}>
              <Text
                style={[styles.previewFieldIndex, { color: colors.textFaint }]}
              >
                {idx + 1}
              </Text>
            </View>
            <View style={styles.previewFieldInfo}>
              <Text
                style={[styles.previewFieldLabel, { color: colors.bone }]}
                numberOfLines={1}
              >
                {field.label}
                {field.required && (
                  <Text style={{ color: colors.danger }}> *</Text>
                )}
              </Text>
              <Text
                style={[
                  styles.previewFieldType,
                  { color: colors.textFaint },
                ]}
              >
                {fieldTypeLabel(field.type)}
              </Text>
            </View>
          </View>
        ))}
        {form.schema.fields.length === 0 && (
          <Text style={{ color: colors.textFaint, fontSize: 13 }}>
            Aucun champ dans ce formulaire.
          </Text>
        )}
      </View>

      {/* Share button */}
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: colors.signal },
          styles.saveButton,
          pressed && { opacity: 0.85 },
        ]}
        onPress={onShareLink}
      >
        <Send size={18} color={colors.bone} />
        <Text style={[styles.saveButtonText, { color: colors.bone }]}>
          Partager le lien du formulaire
        </Text>
      </Pressable>

      {/* Save */}
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: colors.signal },
          styles.saveButton,
          (isSaving || !title.trim()) && { opacity: 0.4 },
          pressed && { opacity: 0.85 },
        ]}
        onPress={onSave}
        disabled={isSaving || !title.trim()}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.bone} />
        ) : (
          <>
            <Save size={18} color={colors.bone} />
            <Text style={[styles.saveButtonText, { color: colors.bone }]}>
              Enregistrer
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2 : Apparence
// ═══════════════════════════════════════════════════════════════

function TabApparence({
  selectedPreset,
  setSelectedPreset,
  customColor,
  setCustomColor,
  bgColor,
  setBgColor,
  bannerUrl,
  setBannerUrl,
  bannerPosition,
  setBannerPosition,
  onSave,
  isSaving,
  colors,
}: {
  selectedPreset: string | undefined;
  setSelectedPreset: (v: string | undefined) => void;
  customColor: string;
  setCustomColor: (v: string) => void;
  bgColor: string;
  setBgColor: (v: string) => void;
  bannerUrl: string;
  setBannerUrl: (v: string) => void;
  bannerPosition: "top" | "center" | "bottom";
  setBannerPosition: (v: "top" | "center" | "bottom") => void;
  onSave: () => void;
  isSaving: boolean;
  colors: any;
}) {
  return (
    <View>
      {/* Color presets */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Couleur principale
      </Text>
      <View style={styles.colorSwatchRow}>
        {COLOR_PRESETS.map((preset) => {
          const isSelected = selectedPreset === preset.value;
          return (
            <Pressable
              key={preset.name}
              style={({ pressed }) => [
                styles.colorSwatchWrapper,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                setSelectedPreset(preset.value);
                setCustomColor(preset.value);
              }}
            >
              <View
                style={[
                  { backgroundColor: preset.value },
                  styles.colorSwatch,
                  isSelected && styles.colorSwatchSelected,
                ]}
              >
                {isSelected && (
                  <Check size={16} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.colorSwatchName,
                  { color: colors.textFaint },
                ]}
              >
                {preset.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Custom color */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Couleur personnalisee (hex)
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.customColorRow,
        ]}
      >
        <View
          style={[
            { backgroundColor: customColor || colors.line },
            styles.customColorPreview,
          ]}
        />
        <TextInput
          style={[
            { color: colors.bone },
            styles.customColorInput,
          ]}
          value={customColor}
          onChangeText={(v) => {
            setCustomColor(v);
            setSelectedPreset(undefined);
          }}
          placeholder="#FF00AA"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
        />
      </View>

      {/* Background presets */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Fond clair
      </Text>
      <View style={styles.bgPresetRow}>
        {BG_PRESETS_LIGHT.map((preset) => {
          const isSelected = bgColor === preset.value;
          return (
            <Pressable
              key={preset.name}
              style={({ pressed }) => [
                {
                  backgroundColor: preset.value,
                  borderColor: preset.value === "#FFFFFF" ? colors.line : preset.value,
                },
                styles.bgPresetSwatch,
                isSelected && styles.bgPresetSelected,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setBgColor(preset.value)}
            />
          );
        })}
      </View>
      <View style={styles.bgPresetLabelRow}>
        {BG_PRESETS_LIGHT.map((preset) => (
          <Text
            key={preset.name}
            style={[
              styles.bgPresetLabel,
              { color: colors.textFaint, width: `${100 / BG_PRESETS_LIGHT.length}%` },
            ]}
            numberOfLines={1}
          >
            {preset.name}
          </Text>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Fond sombre
      </Text>
      <View style={styles.bgPresetRow}>
        {BG_PRESETS_DARK.map((preset) => {
          const isSelected = bgColor === preset.value;
          return (
            <Pressable
              key={preset.name}
              style={({ pressed }) => [
                {
                  backgroundColor: preset.value,
                  borderColor: colors.line,
                },
                styles.bgPresetSwatch,
                isSelected && styles.bgPresetSelected,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setBgColor(preset.value)}
            />
          );
        })}
      </View>
      <View style={styles.bgPresetLabelRow}>
        {BG_PRESETS_DARK.map((preset) => (
          <Text
            key={preset.name}
            style={[
              styles.bgPresetLabel,
              { color: colors.textFaint, width: `${100 / BG_PRESETS_DARK.length}%` },
            ]}
            numberOfLines={1}
          >
            {preset.name}
          </Text>
        ))}
      </View>

      {/* Banner image */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Image de banniere
      </Text>
      {/* Banner URL input */}
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
          { marginBottom: spacing.sm },
        ]}
        value={bannerUrl}
        onChangeText={setBannerUrl}
        placeholder="URL de l'image de banniere"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        keyboardType="url"
      />

      {bannerUrl ? (
        <View style={styles.bannerPreviewContainer}>
          <Image
            source={{ uri: bannerUrl }}
            style={styles.bannerPreview}
            resizeMode="cover"
          />
          <Pressable
            style={({ pressed }) => [
              styles.bannerRemoveBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setBannerUrl("")}
          >
            <X size={16} color={colors.danger} />
          </Pressable>
        </View>
      ) : (
        <View
          style={[
            { borderColor: colors.line, backgroundColor: colors.graphite },
            styles.bannerUploadBtn,
          ]}
        >
          <ImagePlus size={24} color={colors.textFaint} />
          <Text style={[styles.bannerUploadText, { color: colors.textFaint }]}>
            Entrez l'URL ci-dessus pour ajouter une image
          </Text>
        </View>
      )}

      {/* Banner position */}
      {bannerUrl ? (
        <View style={styles.bannerPositionRow}>
          <Text style={[styles.bannerPositionLabel, { color: colors.textMuted }]}>
            Position
          </Text>
          <View style={styles.bannerPositionOptions}>
            {(["top", "center", "bottom"] as const).map((pos) => {
              const isActive = bannerPosition === pos;
              return (
                <Pressable
                  key={pos}
                  style={({ pressed }) => [
                    {
                      backgroundColor: isActive
                        ? colors.signal
                        : colors.graphite,
                      borderColor: isActive ? colors.signal : colors.line,
                    },
                    styles.bannerPositionBtn,
                    pressed && !isActive && { opacity: 0.7 },
                  ]}
                  onPress={() => setBannerPosition(pos)}
                >
                  <Text
                    style={[
                      styles.bannerPositionBtnText,
                      {
                        color: isActive ? colors.bone : colors.textMuted,
                      },
                    ]}
                  >
                    {pos === "top"
                      ? "Haut"
                      : pos === "center"
                      ? "Centre"
                      : "Bas"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Save */}
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: colors.signal },
          styles.saveButton,
          isSaving && { opacity: 0.4 },
          pressed && { opacity: 0.85 },
        ]}
        onPress={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.bone} />
        ) : (
          <>
            <Save size={18} color={colors.bone} />
            <Text style={[styles.saveButtonText, { color: colors.bone }]}>
              Enregistrer le theme
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 3 : Fin
// ═══════════════════════════════════════════════════════════════

function TabFin({
  endingMessage,
  setEndingMessage,
  endingDescription,
  setEndingDescription,
  redirectEnabled,
  setRedirectEnabled,
  redirectButtonLabel,
  setRedirectButtonLabel,
  redirectUrl,
  setRedirectUrl,
  confettiEnabled,
  setConfettiEnabled,
  onSave,
  isSaving,
  colors,
}: {
  endingMessage: string;
  setEndingMessage: (v: string) => void;
  endingDescription: string;
  setEndingDescription: (v: string) => void;
  redirectEnabled: boolean;
  setRedirectEnabled: (v: boolean) => void;
  redirectButtonLabel: string;
  setRedirectButtonLabel: (v: string) => void;
  redirectUrl: string;
  setRedirectUrl: (v: string) => void;
  confettiEnabled: boolean;
  setConfettiEnabled: (v: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  colors: any;
}) {
  return (
    <View>
      {/* Main message */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Message principal
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={endingMessage}
        onChangeText={setEndingMessage}
        placeholder="Reponse enregistree"
        placeholderTextColor={colors.textFaint}
      />

      {/* Description */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Description
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
          styles.textArea,
        ]}
        value={endingDescription}
        onChangeText={setEndingDescription}
        placeholder="Merci pour votre participation"
        placeholderTextColor={colors.textFaint}
        multiline
        numberOfLines={3}
      />

      {/* Redirect toggle */}
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.settingRow,
        ]}
      >
        <View style={styles.settingRowLeft}>
          <Link size={20} color={colors.textMuted} />
          <Text style={[styles.settingRowLabel, { color: colors.bone }]}>
            Rediriger apres reponse
          </Text>
        </View>
        <Switch
          value={redirectEnabled}
          onValueChange={setRedirectEnabled}
          trackColor={{ false: colors.line, true: colors.signalSoft }}
          thumbColor={redirectEnabled ? colors.signal : colors.textFaint}
        />
      </View>

      {redirectEnabled && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Texte du bouton
          </Text>
          <TextInput
            style={[
              {
                color: colors.bone,
                borderColor: colors.line,
                backgroundColor: colors.graphite,
              },
              styles.textInput,
            ]}
            value={redirectButtonLabel}
            onChangeText={setRedirectButtonLabel}
            placeholder="Acceder au site"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            URL de redirection
          </Text>
          <TextInput
            style={[
              {
                color: colors.bone,
                borderColor: colors.line,
                backgroundColor: colors.graphite,
              },
              styles.textInput,
            ]}
            value={redirectUrl}
            onChangeText={setRedirectUrl}
            placeholder="https://example.com"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            keyboardType="url"
          />
        </>
      )}

      {/* Confetti toggle */}
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.settingRow,
        ]}
      >
        <View style={styles.settingRowLeft}>
          <PartyPopper size={20} color={colors.textMuted} />
          <Text style={[styles.settingRowLabel, { color: colors.bone }]}>
            Confettis de fin
          </Text>
        </View>
        <Switch
          value={confettiEnabled}
          onValueChange={setConfettiEnabled}
          trackColor={{ false: colors.line, true: colors.signalSoft }}
          thumbColor={confettiEnabled ? colors.signal : colors.textFaint}
        />
      </View>

      {/* Live preview */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Apercu de la page de fin
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.previewCard,
        ]}
      >
        <Text
          style={[styles.previewEndingTitle, { color: colors.signal }]}
        >
          {endingMessage || "Reponse enregistree"}
        </Text>
        {endingDescription ? (
          <Text
            style={[
              styles.previewEndingDesc,
              { color: colors.textMuted },
            ]}
          >
            {endingDescription}
          </Text>
        ) : null}
        {confettiEnabled && (
          <View style={styles.previewConfettiBadge}>
            <PartyPopper size={16} color={colors.spark} />
            <Text style={[styles.previewConfettiText, { color: colors.spark }]}>
              Confettis actives
            </Text>
          </View>
        )}
        {redirectEnabled && redirectButtonLabel ? (
          <View
            style={[
              { backgroundColor: colors.signal },
              styles.previewRedirectBtn,
            ]}
          >
            <Text
              style={[styles.previewRedirectText, { color: colors.bone }]}
            >
              {redirectButtonLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Save */}
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: colors.signal },
          styles.saveButton,
          isSaving && { opacity: 0.4 },
          pressed && { opacity: 0.85 },
        ]}
        onPress={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.bone} />
        ) : (
          <>
            <Save size={18} color={colors.bone} />
            <Text style={[styles.saveButtonText, { color: colors.bone }]}>
              Enregistrer la page de fin
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 4 : Parametres
// ═══════════════════════════════════════════════════════════════

function TabParametres({
  notificationsEnabled,
  setNotificationsEnabled,
  notificationMode,
  setNotificationMode,
  assignedWhatsapp,
  setAssignedWhatsapp,
  maxSubmissions,
  setMaxSubmissions,
  expiresAt,
  setExpiresAt,
  onSave,
  isSaving,
  colors,
}: {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  notificationMode: FormDetail["notificationMode"];
  setNotificationMode: (v: FormDetail["notificationMode"]) => void;
  assignedWhatsapp: string;
  setAssignedWhatsapp: (v: string) => void;
  maxSubmissions: string;
  setMaxSubmissions: (v: string) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  colors: any;
}) {
  return (
    <View>
      {/* Notifications toggle */}
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.settingRow,
        ]}
      >
        <View style={styles.settingRowLeft}>
          <Bell size={20} color={colors.textMuted} />
          <Text style={[styles.settingRowLabel, { color: colors.bone }]}>
            Notifications
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: colors.line, true: colors.signalSoft }}
          thumbColor={notificationsEnabled ? colors.signal : colors.textFaint}
        />
      </View>

      {/* Frequency selector */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Frequence des notifications
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.freqContainer,
        ]}
      >
        {NOTIFICATION_FREQ.map((freq) => {
          const isSelected = notificationMode === freq.key;
          return (
            <Pressable
              key={freq.key}
              style={({ pressed }) => [
                {
                  backgroundColor: isSelected
                    ? colors.signal
                    : "transparent",
                },
                styles.freqOption,
                pressed && !isSelected && { opacity: 0.7 },
              ]}
              onPress={() => setNotificationMode(freq.key)}
            >
              <Text
                style={[
                  styles.freqOptionText,
                  {
                    color: isSelected ? colors.bone : colors.textMuted,
                  },
                ]}
              >
                {freq.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Delegate WhatsApp number */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Numero WhatsApp delegue
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={assignedWhatsapp}
        onChangeText={setAssignedWhatsapp}
        placeholder="+225 XX XX XX XX XX"
        placeholderTextColor={colors.textFaint}
        keyboardType="phone-pad"
      />

      {/* Max submissions */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Nombre maximal de reponses
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={maxSubmissions}
        onChangeText={setMaxSubmissions}
        placeholder="Illimite"
        placeholderTextColor={colors.textFaint}
        keyboardType="number-pad"
      />

      {/* Expiration date */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Date d'expiration
      </Text>
      <TextInput
        style={[
          {
            color: colors.bone,
            borderColor: colors.line,
            backgroundColor: colors.graphite,
          },
          styles.textInput,
        ]}
        value={expiresAt}
        onChangeText={setExpiresAt}
        placeholder="YYYY-MM-DD ou laisser vide"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
      />

      {/* Save */}
      <Pressable
        style={({ pressed }) => [
          { backgroundColor: colors.signal },
          styles.saveButton,
          isSaving && { opacity: 0.4 },
          pressed && { opacity: 0.85 },
        ]}
        onPress={onSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.bone} />
        ) : (
          <>
            <Save size={18} color={colors.bone} />
            <Text style={[styles.saveButtonText, { color: colors.bone }]}>
              Enregistrer les parametres
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 5 : Statistiques
// ═══════════════════════════════════════════════════════════════

function TabStatistiques({
  analytics,
  isLoading,
  onRefresh,
  colors,
  form,
}: {
  analytics: {
    views: number;
    uniqueVisitors: number;
    completionRate: number;
    submissionCount: number;
    countries: { code: string; name: string; count: number }[];
    cities: { name: string; count: number }[];
  } | null;
  isLoading: boolean;
  onRefresh: () => void;
  colors: any;
  form: FormDetail;
}) {
  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.textMuted} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Chargement des statistiques...
        </Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centerContent}>
        <Text style={[styles.errorText, { color: colors.textMuted }]}>
          Aucune statistique disponible.
        </Text>
        <Pressable
          style={({ pressed }) => [
            { borderColor: colors.line },
            styles.retryButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onRefresh}
        >
          <RefreshCw size={16} color={colors.textMuted} />
          <Text style={[styles.retryText, { color: colors.textMuted }]}>
            Reessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  const completionRateDisplay = Math.round(analytics.completionRate * 100);

  return (
    <View>
      {/* Stat cards */}
      <View style={styles.statsRow}>
        <View
          style={[
            { borderColor: colors.line, backgroundColor: colors.graphite },
            styles.statCard,
          ]}
        >
          <Eye size={22} color={colors.textMuted} />
          <Text style={[styles.statValue, { color: colors.bone }]}>
            {analytics.views.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textFaint }]}>
            Vues
          </Text>
        </View>
        <View
          style={[
            { borderColor: colors.line, backgroundColor: colors.graphite },
            styles.statCard,
          ]}
        >
          <Users size={22} color={colors.textMuted} />
          <Text style={[styles.statValue, { color: colors.bone }]}>
            {analytics.uniqueVisitors.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textFaint }]}>
            Visiteurs uniques
          </Text>
        </View>
        <View
          style={[
            { borderColor: colors.line, backgroundColor: colors.graphite },
            styles.statCard,
          ]}
        >
          <TrendingUp size={22} color={colors.textMuted} />
          <Text style={[styles.statValue, { color: colors.bone }]}>
            {completionRateDisplay}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textFaint }]}>
            Taux de completion
          </Text>
          <Text
            style={[styles.statSubLabel, { color: colors.textFaint }]}
          >
            {analytics.submissionCount} reponse
            {analytics.submissionCount > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Countries breakdown */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Pays
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.listCard,
        ]}
      >
        {analytics.countries.length === 0 ? (
          <Text style={{ color: colors.textFaint, fontSize: 13 }}>
            Aucune donnee de pays disponible.
          </Text>
        ) : (
          analytics.countries.map((country, idx) => (
            <View
              key={country.code || idx}
              style={[
                styles.listItem,
                idx < analytics.countries.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <Text style={[styles.countryFlag, { color: colors.bone }]}>
                  {country.code}
                </Text>
                <Text
                  style={[styles.listItemName, { color: colors.bone }]}
                  numberOfLines={1}
                >
                  {country.name}
                </Text>
              </View>
              <Text
                style={[styles.listItemCount, { color: colors.textMuted }]}
              >
                {country.count}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Cities breakdown */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Villes
      </Text>
      <View
        style={[
          { borderColor: colors.line, backgroundColor: colors.graphite },
          styles.listCard,
        ]}
      >
        {analytics.cities.length === 0 ? (
          <Text style={{ color: colors.textFaint, fontSize: 13 }}>
            Aucune donnee de ville disponible.
          </Text>
        ) : (
          analytics.cities.map((city, idx) => (
            <View
              key={`${city.name}-${idx}`}
              style={[
                styles.listItem,
                idx < analytics.cities.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <MapPin size={16} color={colors.textFaint} />
                <Text
                  style={[styles.listItemName, { color: colors.bone }]}
                  numberOfLines={1}
                >
                  {city.name}
                </Text>
              </View>
              <Text
                style={[styles.listItemCount, { color: colors.textMuted }]}
              >
                {city.count}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Note */}
      <Text
        style={[
          styles.statsNote,
          { color: colors.textFaint },
        ]}
      >
        Les donnees analytiques sont mises a jour en temps reel.
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIconBtn: {
    padding: spacing.sm,
  },

  // ── Tab bar ──
  tabBarScroll: {
    flexGrow: 0,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  tabBarContent: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── Tab content ──
  tabContent: { flex: 1 },
  tabContentInner: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
  },

  // ── Form elements ──
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: typography.fontFamily.displaySemibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingRowLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },

  // ── Link display ──
  linkDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.mono,
    flex: 1,
  },
  linkActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  linkActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flex: 1,
    justifyContent: "center",
  },
  linkActionText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── Form preview ──
  previewCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 16,
  },
  previewSteps: {
    marginBottom: 12,
  },
  previewStepLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  previewField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  previewFieldDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewFieldIndex: {
    fontSize: 11,
    fontFamily: typography.fontFamily.mono,
  },
  previewFieldInfo: {
    flex: 1,
  },
  previewFieldLabel: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  previewFieldType: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
    marginTop: 1,
  },

  // ── Color presets ──
  colorSwatchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  colorSwatchWrapper: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorSwatchName: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
  },

  // ── Custom color ──
  customColorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  customColorPreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  customColorInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.mono,
    paddingVertical: 4,
  },

  // ── BG presets ──
  bgPresetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  bgPresetSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
  },
  bgPresetSelected: {
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bgPresetLabelRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  bgPresetLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
  },

  // ── Banner ──
  bannerUploadBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bannerUploadText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  bannerPreviewContainer: {
    position: "relative",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  bannerPreview: {
    width: "100%",
    height: 160,
    borderRadius: radius.md,
  },
  bannerRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 6,
  },
  bannerPositionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  bannerPositionLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  bannerPositionOptions: {
    flexDirection: "row",
    gap: 6,
  },
  bannerPositionBtn: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerPositionBtnText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // ── Ending preview ──
  previewEndingTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
    textAlign: "center",
    marginBottom: 8,
  },
  previewEndingDesc: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
    marginBottom: 12,
  },
  previewConfettiBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },
  previewConfettiText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  previewRedirectBtn: {
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  previewRedirectText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
  },

  // ── Frequency ──
  freqContainer: {
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  freqOption: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  freqOptionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statSubLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.body,
    marginTop: -2,
  },

  // ── Lists (countries / cities) ──
  listCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  countryFlag: {
    fontSize: 14,
    fontFamily: typography.fontFamily.mono,
    width: 30,
  },
  listItemName: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    flex: 1,
  },
  listItemCount: {
    fontSize: 14,
    fontFamily: typography.fontFamily.mono,
    fontWeight: "600",
  },
  statsNote: {
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  // ── Save button ──
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 15,
    marginTop: spacing.xl,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
  },
});
