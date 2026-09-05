import { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View, Alert, ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { MessageCircle, Download, X, FileText } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import { listForms, listSubmissions, type Submission, type FormSummary } from "@/lib/api";
import { exportAndShareSubmissionsCsv } from "@/lib/csvExport";
import { useOffline } from "@/lib/useOffline";
import { OfflineBanner } from "@/components/OfflineBanner";
import type { ThemeColors } from "@/theme";

type SubmissionRow = Submission & { formTitle: string; formId: string };

// ─── Carte soumission mémoïsée (Phase 2.2) ──────────────────────────
const SubmissionCard = memo(function SubmissionCard({
  submission,
  colors,
}: { submission: SubmissionRow; colors: ThemeColors }) {
  const payload = submission.data ?? submission.answers ?? {};
  const preview = Object.entries(payload)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join("\n");

  return (
    <View style={[{ borderColor: colors.line, backgroundColor: colors.graphite }, styles.card]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.bone }]} numberOfLines={1}>{submission.formTitle}</Text>
        <Text style={[styles.cardDate, { color: colors.textFaint }]}>{formatRelative(submission.createdAt)}</Text>
      </View>
      {preview ? <Text style={[styles.cardPreview, { color: colors.textMuted }]}>{preview}</Text> : null}
    </View>
  );
}, (prev, next) => (
  prev.submission.id === next.submission.id &&
  prev.submission.createdAt === next.submission.createdAt &&
  prev.submission.data === next.submission.data &&
  prev.submission.formTitle === next.submission.formTitle &&
  prev.colors === next.colors
));

export default function ResponsesScreen() {
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const isOffline = useOffline();
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["submissions"],
    queryFn: async (): Promise<SubmissionRow[]> => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée — reconnectez-vous.");
      const forms = await listForms(token);
      const pages = await Promise.all(forms.map(async (form) => {
        const page = await listSubmissions(token, form.id, 10);
        return page.submissions.map((sub) => ({
          ...sub,
          formTitle: form.title,
          formId: form.id,
        }));
      }));
      return pages.flat().sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      }).slice(0, 50);
    },
  });

  // ─── Liste des formulaires pour la modale d'export (Phase 3.5) ────
  const { data: formsList } = useQuery({
    queryKey: ["forms"],
    queryFn: async (): Promise<FormSummary[]> => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée");
      return listForms(token);
    },
  });

  // ─── Mutation d'export CSV (Phase 3.5) ──────────────────────────
  const exportMutation = useMutation({
    mutationFn: async (formId: string) => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée");
      return exportAndShareSubmissionsCsv(token, formId);
    },
    onSuccess: (result) => {
      if (!result.ok) {
        Alert.alert("Export impossible", result.error ?? "Erreur inconnue");
      }
    },
    onError: (err: unknown) => {
      Alert.alert("Export impossible", err instanceof Error ? err.message : "Erreur inconnue");
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: SubmissionRow }) => <SubmissionCard submission={item} colors={colors} />,
    [colors]
  );

  const listData = useMemo(() => data ?? [], [data]);

  const handleExportForm = useCallback((form: FormSummary) => {
    if (isOffline) {
      Alert.alert("Hors-ligne", "L'export CSV nécessite une connexion internet.");
      return;
    }
    setExportModalVisible(false);
    exportMutation.mutate(form.id);
  }, [exportMutation, isOffline]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.bone }]}>Réponses</Text>
        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            { borderColor: colors.line, backgroundColor: colors.graphite, opacity: pressed ? 0.7 : 1 },
            isOffline && { opacity: 0.4 },
          ]}
          onPress={() => !isOffline && setExportModalVisible(true)}
          disabled={isOffline || exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.signal} />
          ) : (
            <Download size={16} color={colors.signal} />
          )}
          <Text style={[styles.exportBtnText, { color: colors.signal }]}>Exporter</Text>
        </Pressable>
      </View>

      <OfflineBanner />

      {isError ? (
        <View style={styles.empty}><Text style={[styles.emptyText, { color: colors.textMuted }]}>{(error as Error).message}</Text></View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.textMuted} />}
          contentContainerStyle={data?.length ? styles.listGrow : styles.emptyGrow}
          renderItem={renderItem}
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageCircle size={32} color={colors.textFaint} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {isLoading ? "Chargement..." : "Aucune réponse pour le moment.\nVous serez notifié dès qu'une arrive."}
              </Text>
            </View>
          }
        />
      )}

      {/* ─── Modale d'export CSV (Phase 3.5) ──────────────────────── */}
      <Modal visible={exportModalVisible} animationType="slide" transparent={true} onRequestClose={() => setExportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.graphite, borderColor: colors.line }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.line }]}>
              <Text style={[styles.modalTitle, { color: colors.bone }]}>Exporter en CSV</Text>
              <Pressable onPress={() => setExportModalVisible(false)} hitSlop={12}>
                <X size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Choisissez le formulaire dont vous voulez exporter les réponses. Le fichier CSV sera
              téléchargé puis proposé au partage natif.
            </Text>
            <FlatList
              data={formsList ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.formRow,
                    { borderColor: colors.line, backgroundColor: colors.graphiteSoft },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handleExportForm(item)}
                  disabled={exportMutation.isPending}
                >
                  <FileText size={18} color={colors.signal} />
                  <View style={styles.formRowText}>
                    <Text style={[styles.formRowTitle, { color: colors.bone }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.formRowMeta, { color: colors.textMuted }]}>
                      {item._count.submissions} réponse{item._count.submissions > 1 ? "s" : ""}
                    </Text>
                  </View>
                  <Download size={18} color={colors.signal} />
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.modalEmpty}>
                  <Text style={[styles.modalEmptyText, { color: colors.textMuted }]}>
                    {formsList === undefined ? "Chargement..." : "Aucun formulaire."}
                  </Text>
                </View>
              }
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 12 },
  heading: { fontSize: 26, fontWeight: "700", fontFamily: typography.fontFamily.display },
  exportBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1,
  },
  exportBtnText: { fontSize: 13, fontWeight: "600", fontFamily: typography.fontFamily.bodyMedium },
  listGrow: { paddingBottom: 20 },
  card: { borderWidth: 1, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold, flex: 1 },
  cardDate: { fontSize: 12, fontFamily: typography.fontFamily.mono },
  cardPreview: { fontSize: 13, fontFamily: typography.fontFamily.body, marginTop: 8, lineHeight: 19 },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyGrow: { flexGrow: 1, justifyContent: "center" },
  emptyText: { fontSize: 15, fontFamily: typography.fontFamily.body, textAlign: "center", lineHeight: 22 },

  // Modale export
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 20 },
  modalContent: { borderWidth: 1, borderRadius: radius.lg, padding: 16, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 1, marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", fontFamily: typography.fontFamily.display },
  modalSubtitle: { fontSize: 13, fontFamily: typography.fontFamily.body, lineHeight: 19, marginBottom: 16 },
  formRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.sm, borderWidth: 1, marginBottom: 8 },
  formRowText: { flex: 1 },
  formRowTitle: { fontSize: 14, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold },
  formRowMeta: { fontSize: 12, fontFamily: typography.fontFamily.body, marginTop: 2 },
  modalEmpty: { padding: 24, alignItems: "center" },
  modalEmptyText: { fontSize: 14, fontFamily: typography.fontFamily.body },
});
