/**
 * OfflineBanner (Phase 3.6)
 *
 * Bandeau discret affiché en haut de chaque écran quand l'app est hors-ligne.
 * Le bandeau informe l'utilisateur que les données affichées proviennent du
 * cache et que les actions mutantes sont désactivées.
 *
 * Usage :
 *   <OfflineBanner />  // auto-render basé sur useOffline()
 */

import { StyleSheet, View, Text } from "react-native";
import { WifiOff } from "lucide-react-native";
import { useOffline } from "@/lib/useOffline";
import { useTheme } from "@/context/ThemeContext";
import { typography, radius } from "@/theme";

export function OfflineBanner({ compact = false }: { compact?: boolean }) {
  const isOffline = useOffline();
  const { colors } = useTheme();

  if (!isOffline) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.sparkSoft,
          borderColor: colors.spark,
          paddingVertical: compact ? 6 : 8,
        },
      ]}
    >
      <WifiOff size={14} color={colors.spark} />
      <Text style={[styles.text, { color: colors.spark }]}>
        Mode hors-ligne — affichage du cache, actions désactivées
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: typography.fontFamily.bodyMedium,
  },
});
