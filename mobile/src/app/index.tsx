import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Redirect, useRootNavigationState } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useTheme } from "@/context/ThemeContext";
import KMark from "@/components/ui/KMark";

export default function SplashScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors } = useTheme();
  const [ready, setReady] = useState(false);
  const rootNavState = useRootNavigationState();
  const navReady = rootNavState?.key != null;

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded || !ready || !navReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.ink }]}>
        <KMark size={72} />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? "/(tabs)" : "/welcome"} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
