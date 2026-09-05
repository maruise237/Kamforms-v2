import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react-native";
import { typography, radius } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import * as Sentry from "@sentry/react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://kamforms.com";

/**
 * Écran de suppression de compte (Phase 3.1 — règle Apple App Store 5.1.1v7).
 *
 * Apple exige depuis 2022 que toute app permettant la création de compte
 * propose aussi un flux de suppression. Sans cet écran, l'app peut être
 * rejetée à la review.
 *
 * Flux :
 *  1. User confirme → Alert.alert avec 2 boutons (Annuler / Supprimer définitivement)
 *  2. Si confirmation : appel API backend DELETE /api/user (cascade Prisma déjà configurée)
 *     qui supprime User + Form[] + Submission[] + UsageEvent[] + MobilePushToken[]
 *  3. Clerk.user.delete() pour supprimer l'auth côté Clerk
 *  4. signOut() local + redirection vers /welcome
 *
 * ⚠️ Endpoint backend à ajouter dans kamforms-main/src/app/api/user/route.ts :
 *    export async function DELETE(req: Request) {
 *      const { userId } = await auth();
 *      if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *      await prisma.user.delete({ where: { id: userId } });
 *      return NextResponse.json({ ok: true });
 *    }
 */
export default function DeleteAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useUser();
  const { signOut, getToken } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    Alert.alert(
      "Supprimer définitivement le compte ?",
      "Cette action est irréversible. Tous vos formulaires, vos réponses et vos paramètres " +
      "seront effacés. Vous ne pourrez pas les récupérer.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              // 1. Supprimer les données côté backend (cascade Prisma)
              const token = await getToken();
              if (token) {
                await fetch(`${API_URL}/api/user`, {
                  method: "DELETE",
                  headers: { authorization: `Bearer ${token}` },
                });
              }

              // 2. Supprimer le user côté Clerk
              if (user) await user.delete();

              // 3. Sign out local + redirect
              await signOut();
              router.replace("/welcome");
            } catch (err) {
              Sentry.captureException(err);
              Alert.alert(
                "Erreur",
                "Impossible de supprimer le compte complètement. " +
                "Réessayez plus tard ou contactez hello@kamforms.com."
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} disabled={busy}>
          <ArrowLeft size={22} color={colors.bone} />
        </Pressable>
        <Text style={[styles.title, { color: colors.bone }]}>Supprimer le compte</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.warningCard, { borderColor: colors.danger, backgroundColor: colors.graphite }]}>
          <AlertTriangle size={28} color={colors.danger} />
          <Text style={[styles.warningTitle, { color: colors.danger }]}>Action irréversible</Text>
          <Text style={[styles.warningText, { color: colors.textMuted }]}>
            La suppression de votre compte efface définitivement tous vos formulaires,
            toutes vos réponses, vos paramètres et votre historique d'utilisation.
            Cette action ne peut pas être annulée.
          </Text>
        </View>

        <View style={[styles.sectionCard, { borderColor: colors.line, backgroundColor: colors.graphite }]}>
          <Text style={[styles.sectionTitle, { color: colors.bone }]}>Ce qui sera supprimé</Text>
          <View style={[{ borderColor: colors.line }, styles.separator]} />
          <BulletItem colors={colors} text="Tous vos formulaires et leurs URLs publiques" />
          <BulletItem colors={colors} text="Toutes les soumissions reçues (avec export CSV impossible a posteriori)" />
          <BulletItem colors={colors} text="Vos paramètres WhatsApp / email / push" />
          <BulletItem colors={colors} text="Votre historique d'usage (quotas, factures)" />
          <BulletItem colors={colors} text="Votre abonnement actif (sans remboursement automatique — contactez le support)" />
        </View>

        <View style={[styles.sectionCard, { borderColor: colors.line, backgroundColor: colors.graphite }]}>
          <Text style={[styles.sectionTitle, { color: colors.bone }]}>Ce qui sera conservé</Text>
          <View style={[{ borderColor: colors.line }, styles.separator]} />
          <BulletItem colors={colors} text="Vos factures déjà émises (conservées pour raisons légales)" />
          <BulletItem colors={colors} text="Les logs d'audit serveur (anonymisés)" />
        </View>

        <Text style={[styles.support, { color: colors.textMuted }]}>
          Besoin d'aide ? Écrivez à <Text style={{ color: colors.signal }}>hello@kamforms.com</Text> avant de supprimer.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: colors.danger, opacity: pressed ? 0.8 : 1 },
            busy && { opacity: 0.5 },
          ]}
          onPress={handleDelete}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Trash2 size={18} color="#FFFFFF" />
              <Text style={styles.deleteBtnText}>Supprimer définitivement mon compte</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BulletItem({ text, colors }: { text: string; colors: any }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bullet, { backgroundColor: colors.textFaint }]} />
      <Text style={[styles.bulletText, { color: colors.bone }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "700", fontFamily: typography.fontFamily.display },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  warningCard: {
    borderWidth: 1, borderRadius: radius.md, padding: 18, alignItems: "center", gap: 8,
    marginTop: 8, marginBottom: 18,
  },
  warningTitle: { fontSize: 16, fontWeight: "700", fontFamily: typography.fontFamily.display, marginTop: 4 },
  warningText: { fontSize: 13, fontFamily: typography.fontFamily.body, lineHeight: 19, textAlign: "center" },
  sectionCard: { borderWidth: 1, borderRadius: radius.md, padding: 14, marginBottom: 12, gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "600", fontFamily: typography.fontFamily.displaySemibold },
  separator: { height: 1, marginVertical: 2 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 2 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 7 },
  bulletText: { fontSize: 13, fontFamily: typography.fontFamily.body, lineHeight: 18, flex: 1 },
  support: { fontSize: 12, fontFamily: typography.fontFamily.body, textAlign: "center", marginVertical: 20, lineHeight: 18 },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 14, borderRadius: radius.sm, marginTop: 8,
  },
  deleteBtnText: { fontSize: 14, fontWeight: "700", fontFamily: typography.fontFamily.bodyMedium, color: "#FFFFFF" },
});
