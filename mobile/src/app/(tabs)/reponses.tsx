import { memo, useCallback, useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { MessageCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import { listForms, listSubmissions, type Submission } from "@/lib/api";
import type { ThemeColors } from "@/theme";

type SubmissionRow = Submission & { formTitle: string };

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
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["submissions"],
    queryFn: async (): Promise<SubmissionRow[]> => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée — reconnectez-vous.");
      const forms = await listForms(token);
      const pages = await Promise.all(forms.map(async (form) => {
        const page = await listSubmissions(token, form.id, 10);
        return page.submissions.map((sub) => ({ ...sub, formTitle: form.title }));
      }));
      return pages.flat().sort((a, b) => {
        const ta = new Date(a.createdAt).getTime();
        const tb = new Date(b.createdAt).getTime();
        return tb - ta;
      }).slice(0, 50);
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: SubmissionRow }) => <SubmissionCard submission={item} colors={colors} />,
    [colors]
  );

  const listData = useMemo(() => data ?? [], [data]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <Text style={[styles.heading, { color: colors.bone }]}>Réponses</Text>
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
  heading: { fontSize: 26, fontWeight: "700", fontFamily: typography.fontFamily.display, marginVertical: 16 },
  listGrow: { paddingBottom: 20 },
  card: { borderWidth: 1, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold, flex: 1 },
  cardDate: { fontSize: 12, fontFamily: typography.fontFamily.mono },
  cardPreview: { fontSize: 13, fontFamily: typography.fontFamily.body, marginTop: 8, lineHeight: 19 },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyGrow: { flexGrow: 1, justifyContent: "center" },
  emptyText: { fontSize: 15, fontFamily: typography.fontFamily.body, textAlign: "center", lineHeight: 22 },
});
