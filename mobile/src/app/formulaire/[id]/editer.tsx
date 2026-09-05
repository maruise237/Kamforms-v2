import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
} from "lucide-react-native";
import { typography, radius, spacing } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import { getForm, updateForm, type FormField } from "@/lib/api";
import TopBack from "@/components/ui/TopBack";

const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Texte" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telephone" },
  { value: "number", label: "Nombre" },
  { value: "textarea", label: "Zone de texte" },
  { value: "select", label: "Liste deroulante" },
  { value: "radio", label: "Choix unique" },
  { value: "checkbox", label: "Cases a cocher" },
  { value: "date", label: "Date" },
  { value: "rating", label: "Note" },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function createEmptyField(): FormField {
  return {
    id: generateId(),
    type: "text",
    label: "",
    description: "",
    placeholder: "",
    required: false,
  };
}

export default function EditFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [typePickerIndex, setTypePickerIndex] = useState<number | null>(null);

  // Charge le formulaire existant
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Session expiree — reconnectez-vous.");
        const form = await getForm(token, id);
        if (cancelled) return;
        setTitle(form.title);
        setDescription(form.description ?? "");
        setFields(form.schema.fields ?? []);
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Impossible de charger le formulaire."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, getToken]);

  // Gestion des champs
  const addField = useCallback(() => {
    setFields((prev) => [...prev, createEmptyField()]);
  }, []);

  const removeField = useCallback((index: number) => {
    setFields((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const moveField = useCallback((from: number, to: number) => {
    if (to < 0) return;
    setFields((prev) => {
      if (to >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }, []);

  const updateField = useCallback(
    (index: number, updates: Partial<FormField>) => {
      setFields((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], ...updates };
        return copy;
      });
    },
    []
  );

  const addOption = useCallback((index: number) => {
    setFields((prev) => {
      const copy = [...prev];
      const field = copy[index];
      const options = field.options ?? [];
      copy[index] = { ...field, options: [...options, ""] };
      return copy;
    });
  }, []);

  const removeOption = useCallback((fieldIndex: number, optionIndex: number) => {
    setFields((prev) => {
      const copy = [...prev];
      const field = copy[fieldIndex];
      const options = field.options ?? [];
      if (options.length <= 1) return prev;
      copy[fieldIndex] = {
        ...field,
        options: options.filter((_, i) => i !== optionIndex),
      };
      return copy;
    });
  }, []);

  const updateOption = useCallback(
    (fieldIndex: number, optionIndex: number, value: string) => {
      setFields((prev) => {
        const copy = [...prev];
        const field = copy[fieldIndex];
        const options = [...(field.options ?? [])];
        options[optionIndex] = value;
        copy[fieldIndex] = { ...field, options };
        return copy;
      });
    },
    []
  );

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push("Le titre est obligatoire.");
    fields.forEach((field, i) => {
      if (!field.label.trim()) {
        errors.push(`Le champ #${i + 1} doit avoir un libelle.`);
      }
    });
    return errors;
  }, [title, fields]);

  const isValid = validationErrors.length === 0;

  // Sauvegarde
  const handleSave = useCallback(async () => {
    if (!isValid || saving || !id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expiree — reconnectez-vous.");
      await updateForm(token, id, {
        title: title.trim(),
        description: description.trim() || null,
        schema: { fields },
      });
      void queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.back();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "La sauvegarde a echoue."
      );
    } finally {
      setSaving(false);
    }
  }, [isValid, saving, id, title, description, fields, getToken, queryClient, router]);

  // ── Ecran de chargement ──

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.ink }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Ecran d'erreur ──

  if (fetchError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.ink }]}
        edges={["top"]}
      >
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {fetchError}
          </Text>
          <Pressable
            style={({ pressed }) => [
              { borderColor: colors.line },
              styles.retryButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.retryButtonText, { color: colors.bone }]}>
              Retour
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Editeur ──

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.ink }]}
      edges={["top"]}
    >
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
            Editer le formulaire
          </Text>

          {/* ── Titre ── */}
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Titre
          </Text>
          <View
            style={[
              { borderColor: colors.line, backgroundColor: colors.graphite },
              styles.inputCard,
            ]}
          >
            <TextInput
              style={{ color: colors.bone, ...styles.input }}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre du formulaire"
              placeholderTextColor={colors.textFaint}
              editable={!saving}
            />
          </View>

          {/* ── Description ── */}
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Description (optionnelle)
          </Text>
          <View
            style={[
              { borderColor: colors.line, backgroundColor: colors.graphite },
              styles.inputCard,
            ]}
          >
            <TextInput
              style={{ color: colors.bone, ...styles.textarea }}
              value={description}
              onChangeText={setDescription}
              placeholder="Description ou sous-titre du formulaire"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              maxLength={2000}
              editable={!saving}
            />
          </View>

          {/* ── Champs ── */}
          <View style={styles.fieldsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.bone }]}>
              Champs
            </Text>
            <Text
              style={[styles.fieldsCount, { color: colors.textMuted }]}
            >
              {fields.length} champ{fields.length > 1 ? "s" : ""}
            </Text>
          </View>

          {fields.map((field, index) => (
            <View
              key={field.id}
              style={[
                { borderColor: colors.line, backgroundColor: colors.graphite },
                styles.fieldCard,
              ]}
            >
              {/* Barre d'outils */}
              <View style={styles.fieldToolbar}>
                <View style={styles.fieldToolbarLeft}>
                  <Pressable
                    onPress={() => moveField(index, index - 1)}
                    disabled={index === 0 || saving}
                    style={({ pressed }) => [
                      styles.toolButton,
                      pressed && { opacity: 0.6 },
                      index === 0 && styles.toolButtonDisabled,
                    ]}
                  >
                    <ArrowUp
                      size={15}
                      color={index === 0 ? colors.textFaint : colors.textMuted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => moveField(index, index + 1)}
                    disabled={index === fields.length - 1 || saving}
                    style={({ pressed }) => [
                      styles.toolButton,
                      pressed && { opacity: 0.6 },
                      index === fields.length - 1 && styles.toolButtonDisabled,
                    ]}
                  >
                    <ArrowDown
                      size={15}
                      color={
                        index === fields.length - 1
                          ? colors.textFaint
                          : colors.textMuted
                      }
                    />
                  </Pressable>
                  <Text
                    style={[styles.fieldIndex, { color: colors.textFaint }]}
                  >
                    #{index + 1}
                  </Text>
                </View>

                <View style={styles.fieldToolbarRight}>
                  <Pressable
                    onPress={() => setTypePickerIndex(index)}
                    disabled={saving}
                    style={({ pressed }) => [
                      {
                        borderColor: colors.line,
                        backgroundColor: colors.graphiteSoft,
                      },
                      styles.typeBadge,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {FIELD_TYPES.find((t) => t.value === field.type)?.label ??
                        field.type}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      updateField(index, { required: !field.required })
                    }
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.requiredToggle,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View
                      style={[
                        {
                          borderColor: colors.line,
                          backgroundColor: field.required
                            ? colors.signal
                            : "transparent",
                        },
                        styles.checkbox,
                      ]}
                    />
                    <Text
                      style={[
                        styles.requiredLabel,
                        { color: colors.textMuted },
                        field.required && { color: colors.signal },
                      ]}
                    >
                      Obligatoire
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => removeField(index)}
                    disabled={fields.length <= 1 || saving}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && { opacity: 0.6 },
                      fields.length <= 1 && styles.toolButtonDisabled,
                    ]}
                  >
                    <Trash2
                      size={16}
                      color={
                        fields.length <= 1 ? colors.textFaint : colors.danger
                      }
                    />
                  </Pressable>
                </View>
              </View>

              {/* Label */}
              <Text style={[styles.fieldSubLabel, { color: colors.textMuted }]}>
                Libelle
              </Text>
              <View
                style={[
                  { borderColor: colors.line, backgroundColor: colors.graphiteSoft },
                  styles.fieldInputCard,
                ]}
              >
                <TextInput
                  style={{ color: colors.bone, ...styles.fieldInput }}
                  value={field.label}
                  onChangeText={(val) => updateField(index, { label: val })}
                  placeholder="Libelle du champ"
                  placeholderTextColor={colors.textFaint}
                  editable={!saving}
                />
              </View>

              {/* Description / aide */}
              <Text style={[styles.fieldSubLabel, { color: colors.textMuted }]}>
                Texte d&apos;aide (optionnel)
              </Text>
              <View
                style={[
                  { borderColor: colors.line, backgroundColor: colors.graphiteSoft },
                  styles.fieldInputCard,
                ]}
              >
                <TextInput
                  style={{ color: colors.bone, ...styles.fieldInput }}
                  value={field.description ?? ""}
                  onChangeText={(val) =>
                    updateField(index, { description: val })
                  }
                  placeholder="Exemple : Saisissez votre adresse email"
                  placeholderTextColor={colors.textFaint}
                  editable={!saving}
                />
              </View>

              {/* Placeholder */}
              <Text style={[styles.fieldSubLabel, { color: colors.textMuted }]}>
                Placeholder (optionnel)
              </Text>
              <View
                style={[
                  { borderColor: colors.line, backgroundColor: colors.graphiteSoft },
                  styles.fieldInputCard,
                ]}
              >
                <TextInput
                  style={{ color: colors.bone, ...styles.fieldInput }}
                  value={field.placeholder ?? ""}
                  onChangeText={(val) =>
                    updateField(index, { placeholder: val })
                  }
                  placeholder="Texte indicatif dans le champ"
                  placeholderTextColor={colors.textFaint}
                  editable={!saving}
                />
              </View>

              {/* Options pour select / radio */}
              {(field.type === "select" || field.type === "radio") && (
                <View style={styles.optionsSection}>
                  <Text
                    style={[styles.fieldSubLabel, { color: colors.textMuted }]}
                  >
                    Options
                  </Text>
                  {(field.options ?? []).map((option, optIndex) => (
                    <View key={optIndex} style={styles.optionRow}>
                      <View
                        style={[
                          {
                            borderColor: colors.line,
                            backgroundColor: colors.graphiteSoft,
                          },
                          styles.optionInputCard,
                        ]}
                      >
                        <TextInput
                          style={{ color: colors.bone, ...styles.fieldInput }}
                          value={option}
                          onChangeText={(val) =>
                            updateOption(index, optIndex, val)
                          }
                          placeholder={`Option ${optIndex + 1}`}
                          placeholderTextColor={colors.textFaint}
                          editable={!saving}
                        />
                      </View>
                      <Pressable
                        onPress={() => removeOption(index, optIndex)}
                        disabled={(field.options ?? []).length <= 1 || saving}
                        style={({ pressed }) => [
                          styles.optionRemoveButton,
                          pressed && { opacity: 0.6 },
                        ]}
                      >
                        <Trash2
                          size={14}
                          color={
                            (field.options ?? []).length <= 1
                              ? colors.textFaint
                              : colors.danger
                          }
                        />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable
                    onPress={() => addOption(index)}
                    disabled={saving}
                    style={({ pressed }) => [
                      { borderColor: colors.line },
                      styles.addOptionButton,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Plus size={13} color={colors.textMuted} />
                    <Text
                      style={[
                        styles.addOptionText,
                        { color: colors.textMuted },
                      ]}
                    >
                      Ajouter une option
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}

          {/* Bouton Ajouter un champ */}
          <Pressable
            onPress={addField}
            disabled={saving}
            style={({ pressed }) => [
              { borderColor: colors.line },
              styles.addFieldButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Plus size={16} color={colors.signal} />
            <Text
              style={[styles.addFieldText, { color: colors.signal }]}
            >
              Ajouter un champ
            </Text>
          </Pressable>

          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <View style={styles.validationErrors}>
              {validationErrors.map((err, i) => (
                <Text
                  key={i}
                  style={[styles.validationErrorText, { color: colors.danger }]}
                >
                  {err}
                </Text>
              ))}
            </View>
          )}

          {saveError && (
            <Text style={[styles.saveErrorText, { color: colors.danger }]}>
              {saveError}
            </Text>
          )}

          {/* Bouton Sauvegarder */}
          <Pressable
            onPress={handleSave}
            disabled={!isValid || saving}
            style={({ pressed }) => [
              { backgroundColor: colors.signal },
              styles.saveButton,
              (!isValid || saving) && styles.saveButtonDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            {saving ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator color={colors.bone} />
                <Text
                  style={[styles.saveButtonText, { color: colors.bone }]}
                >
                  Sauvegarde en cours...
                </Text>
              </View>
            ) : (
              <View style={styles.saveButtonContent}>
                <Save size={17} color={colors.bone} />
                <Text
                  style={[styles.saveButtonText, { color: colors.bone }]}
                >
                  Sauvegarder
                </Text>
              </View>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Modale de sélection du type ── */}
      <Modal
        visible={typePickerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerIndex(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTypePickerIndex(null)}
        >
          <Pressable
            style={[
              { backgroundColor: colors.graphite, borderColor: colors.line },
              styles.modalContent,
            ]}
            onPress={() => {}} // Empêche la fermeture en cliquant sur le contenu
          >
            <Text style={[styles.modalTitle, { color: colors.bone }]}>
              Choisir le type de champ
            </Text>
            {FIELD_TYPES.map((type) => (
              <Pressable
                key={type.value}
                style={({ pressed }) => [
                  { borderBottomColor: colors.line },
                  styles.modalOption,
                  typePickerIndex !== null &&
                    fields[typePickerIndex]?.type === type.value && {
                      backgroundColor: colors.graphiteSoft,
                    },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (typePickerIndex !== null) {
                    const isSelectOrRadio = type.value === "select" || type.value === "radio";
                    const currentType = fields[typePickerIndex]?.type;
                    const wasSelectOrRadio = currentType === "select" || currentType === "radio";
                    updateField(typePickerIndex, {
                      type: type.value,
                      ...(isSelectOrRadio && !wasSelectOrRadio
                        ? { options: [""] }
                        : {}),
                      ...(!isSelectOrRadio && wasSelectOrRadio
                        ? { options: undefined }
                        : {}),
                    });
                    setTypePickerIndex(null);
                  }
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.bone },
                    typePickerIndex !== null &&
                      fields[typePickerIndex]?.type === type.value && {
                        color: colors.signal,
                      },
                  ]}
                >
                  {type.label}
                </Text>
                {typePickerIndex !== null &&
                  fields[typePickerIndex]?.type === type.value && (
                    <View
                      style={[
                        { backgroundColor: colors.signal },
                        styles.modalCheck,
                      ]}
                    />
                  )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  input: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    padding: 0,
  },
  textarea: {
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
    minHeight: 70,
    textAlignVertical: "top",
    padding: 0,
  },
  fieldsHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
  },
  fieldsCount: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },

  // Carte de champ
  fieldCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fieldToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 2,
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  fieldToolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  fieldToolbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  toolButton: {
    padding: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  toolButtonDisabled: {
    opacity: 0.3,
  },
  fieldIndex: {
    fontSize: 12,
    fontFamily: typography.fontFamily.mono,
    marginLeft: spacing.xs,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  requiredToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
  },
  requiredLabel: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  deleteButton: {
    padding: spacing.xs + 1,
    borderRadius: radius.sm,
  },

  // Sous-champs
  fieldSubLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: typography.fontFamily.displaySemibold,
    marginTop: spacing.sm + 2,
    marginBottom: spacing.xs + 2,
  },
  fieldInputCard: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  fieldInput: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
    padding: 0,
  },

  // Options
  optionsSection: {
    marginTop: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs + 2,
  },
  optionInputCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  optionRemoveButton: {
    padding: spacing.xs + 2,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    alignSelf: "flex-start",
    marginTop: spacing.xs,
  },
  addOptionText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },

  // Bouton Ajouter un champ
  addFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.sm,
  },
  addFieldText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: typography.fontFamily.bodyMedium,
  },

  // Validation
  validationErrors: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  validationErrorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  saveErrorText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
    marginTop: spacing.md,
    textAlign: "center",
  },

  // Bouton Sauvegarder
  saveButton: {
    width: "100%",
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
  },

  // Modale
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: typography.fontFamily.display,
    marginBottom: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  modalCheck: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
