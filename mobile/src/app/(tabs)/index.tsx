import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Plus, Shield, FileText, Flame } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import { formPublicUrl, listForms, cloneForm, deleteForm, type FormSummary } from "@/lib/api";
import type { ThemeColors } from "@/theme";
import { OfflineBanner } from "@/components/OfflineBanner";

// ─── Carte formulaire mémoïsée (Phase 2.2) ──────────────────────────
// La carte ne re-render que si les props changent (item + colors + handlers stables)
type FormCardProps = {
  item: FormSummary;
  colors: ThemeColors;
  onDelete: (id: string, title: string) => void;
};

const FormCard = memo(function FormCard({ item, colors, onDelete }: FormCardProps) {
  return (
    <View style={[styles.card, { borderColor: colors.line, backgroundColor: colors.graphite }]}>
      <View style={styles.cardRow}>
        <Text style={[styles.cardTitle, { color: colors.bone }]} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: item.active ? colors.signalSoft : colors.graphiteSoft }]}>
          <Text style={{ color: item.active ? colors.signal : colors.textMuted, fontSize: 12, fontWeight: "600" }}>
            {item.active ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>
      <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
        {item._count.submissions} réponse{item._count.submissions > 1 ? "s" : ""}
      </Text>
      <View style={styles.cardActions}>
        <Pressable
          style={[styles.actionBtn, { borderColor: colors.line }]}
          onPress={() => Share.share({ message: `Répondez à mon formulaire : ${formPublicUrl(item.slug)}` })}
        >
          <Text style={[styles.actionText, { color: colors.bone }]}>Partager</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { borderColor: colors.line }]}
          onPress={() => onDelete(item.id, item.title)}
        >
          <Text style={[styles.actionText, { color: colors.danger }]}>Supprimer</Text>
        </Pressable>
      </View>
    </View>
  );
}, (prev, next) => {
  // Comparaison custom : on ne re-render que si l'item ou le thème change
  return (
    prev.item.id === next.item.id &&
    prev.item._count.submissions === next.item._count.submissions &&
    prev.item.active === next.item.active &&
    prev.item.title === next.item.title &&
    prev.colors === next.colors
  );
});

export default function FormsScreen() {
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: forms, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée");
      return listForms(token);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error("Session expirée");
      return deleteForm(token, id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  });

  // Handler stable : la closure ne change pas entre les renders
  // → la carte mémoïsée ne re-render pas inutilement
  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert("Supprimer", `Supprimer "${title}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate(id) },
    ]);
  }, [deleteMutation]);

  // renderItem mémoïsé pour éviter la recréation de closure à chaque render
  const renderItem = useCallback(({ item }: { item: FormSummary }) => (
    <FormCard item={item} colors={colors} onDelete={handleDelete} />
  ), [colors, handleDelete]);

  const listData = useMemo(() => forms ?? [], [forms]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.bone }]}>Mes formulaires</Text>
        <View style={[styles.streakBadge, { backgroundColor: colors.sparkSoft }]}>
          <Flame size={14} color={colors.spark} />
          <Text style={[styles.streakText, { color: colors.spark }]}>0 jour</Text>
        </View>
      </View>

      <OfflineBanner />

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.textMuted} />}
        contentContainerStyle={forms?.length ? { paddingBottom: 80 } : styles.emptyGrow}
        renderItem={renderItem}
        // Performance : 50 Mo de mémoire max par fenêtre de rendu
        // et pas de re-render des cartes hors écran
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.empty}>
            {isLoading ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chargement...</Text>
            ) : isError ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{(error as Error)?.message}</Text>
            ) : (
              <>
                <FileText size={36} color={colors.textFaint} />
                <Text style={[styles.emptyText, { color: colors.textMuted, marginTop: 12 }]}>Aucun formulaire</Text>
              </>
            )}
          </View>
        }
      />

      <Pressable style={[styles.fab, { backgroundColor: colors.signal }]} onPress={() => router.push("/creer" as any)}>
        <Plus size={22} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", fontFamily: typography.fontFamily.display },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontSize: 12, fontWeight: "600", fontFamily: typography.fontFamily.mono },
  card: { borderWidth: 1, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold, flex: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  cardMeta: { fontSize: 13, marginTop: 6 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  actionBtn: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: "500" },
  fab: { position: "absolute", bottom: 20, right: 20, width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyGrow: { flexGrow: 1, justifyContent: "center" },
  emptyText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
