import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { typography } from "@/theme";
import { useTheme } from "@/context/ThemeContext";
import IconTile from "@/components/ui/IconTile";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.ink }]}>
      <View style={styles.content}>
        <IconTile icon={Bell} bg={colors.sparkSoft} color={colors.spark} size={56} />
        <Text style={[styles.title, { color: colors.bone }]}>Ne manquez aucune réponse</Text>
        <Text style={[styles.body, { color: colors.textMuted }]}>
          En plus de WhatsApp, recevez une alerte sur votre téléphone dès qu'un formulaire est rempli.
        </Text>
        <View style={styles.spacer} />
        <View style={styles.actions}>
          <PrimaryButton onPress={() => router.push("/onboarding/checklist" as any)}>Activer les notifications</PrimaryButton>
          <Text style={[styles.skip, { color: colors.textMuted }]} onPress={() => router.push("/onboarding/checklist" as any)}>Plus tard</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", fontFamily: typography.fontFamily.display, lineHeight: 28, textAlign: "center", marginTop: 24 },
  body: { fontSize: 13.5, fontFamily: typography.fontFamily.body, lineHeight: 20, textAlign: "center", marginTop: 8 },
  spacer: { flex: 1 },
  actions: { width: "100%", gap: 12, alignItems: "center" },
  skip: { fontSize: 13, fontWeight: "500", fontFamily: typography.fontFamily.bodyMedium, paddingVertical: 8 },
});
