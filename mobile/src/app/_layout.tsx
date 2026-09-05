import { useCallback, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { registerExpoToken } from "@/lib/api";
import { dlog } from "@/lib/debugLog";
import { kamformsFonts } from "@/lib/fonts";
import { setupQueryCachePersistence, prefetchCriticalQueries } from "@/lib/queryCache";
import { parseKamformsLink } from "@/lib/deepLinking";
import * as SecureStore from "expo-secure-store";
import {
  configureNotificationHandler,
  registerForPushNotifications,
  setupAndroidChannel,
} from "@/lib/notifications";
import { useFonts } from "expo-font";
import { darkColors } from "@/theme";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import KMark from "@/components/ui/KMark";

// ─── Sentry (no-op tant que SENTRY_DSN n'est pas configuré) ────────
// Initialisé ici pour que les crashes de RootLayout soient capturés
// dès le premier render. Sans DSN, *Sentry.init* est un no-op
// (cf. @sentry/react-native).
import * as Sentry from "@sentry/react-native";

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? "development" : "production",
    // Pas de tracing natif en dev pour éviter le bruit
    enableAutoSessionTracking: !__DEV__,
    tracesSampleRate: __DEV__ ? 0 : 0.2,
  });
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
});

SplashScreen.preventAutoHideAsync();

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "";
const clerkKeyMissing = !publishableKey || publishableKey.includes("xxxx");

// ─── QueryClient : cache 60s, retry 1, prefetch des queries critiques ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000, // 60s (était 30s) — tolérance offline accrue
      gcTime: 5 * 60_000, // 5 min en cache mémoire
      refetchOnWindowFocus: false, // économie de bande passante mobile
      refetchOnReconnect: true, // re-fetch au retour du réseau (offline-first)
    },
  },
});

// ─── Persistance du cache React Query sur AsyncStorage (Phase 2.3) ──
// No-op en dev pour éviter de masquer les bugs de fetch pendant les tests.
if (!__DEV__) {
  try {
    const [, restorePromise] = setupQueryCachePersistence(queryClient);
    restorePromise.catch((err: unknown) => {
      console.warn("Query cache persistence failed:", err);
    });
  } catch (err) {
    console.warn("Query cache setup failed:", err);
  }
}

function RootNavigator() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Notification handler + canal Android au démarrage
  useEffect(() => {
    configureNotificationHandler();
    void setupAndroidChannel();
  }, []);

  // ─── Diagnostic démarrage (visible dans le panneau Debug en DEV) ──
  useEffect(() => {
    if (!__DEV__) return; // skip en prod pour économiser CPU + mémoire
    dlog(
      "boot",
      `apiUrl=${process.env.EXPO_PUBLIC_API_URL ? "ok" : "ABSENT"} clerkKey=${publishableKey.slice(0, 15)}…`
    );
    (async () => {
      try {
        await SecureStore.setItemAsync("kamforms_probe", "ok");
        const value = await SecureStore.getItemAsync("kamforms_probe");
        dlog("securestore", value === "ok" ? "lecture/écriture OK" : `valeur inattendue: ${String(value)}`);
      } catch (err) {
        dlog("securestore", `ERREUR: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, []);

  // Trace des transitions d'authentification (DEV only)
  useEffect(() => {
    if (__DEV__ && isLoaded) dlog("auth", `isSignedIn=${String(isSignedIn)}`);
  }, [isLoaded, isSignedIn]);

  // Enregistrement du token push + préchargement queries critiques
  useEffect(() => {
    if (!isSignedIn) return;
    void registerForPushNotifications(async (expoPushToken, platform) => {
      const token = await getToken();
      if (!token) return;
      await registerExpoToken(token, expoPushToken, platform);
      if (__DEV__) dlog("push", "token Expo enregistré");
    }).catch((err) => {
      if (__DEV__) dlog("push", `enregistrement impossible: ${err instanceof Error ? err.message : String(err)}`);
      Sentry.captureException(err);
    });

    // Préchargement parallèle des queries critiques pendant le splash
    // pour que l'utilisateur voie ses formulaires instantanément à l'arrivée
    prefetchCriticalQueries(queryClient, getToken).catch((err) => {
      Sentry.captureException(err);
    });
  }, [isSignedIn, getToken]);

  // Tap sur notification → onglet Réponses
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push("/(tabs)/reponses");
    });
    return () => sub.remove();
  }, [router]);

  // ─── Deep linking kamforms:// (Phase 3.7) ─────────────────────────
  // Gestion des liens entrants : kamforms://form/[slug], kamforms://formulaire/[id],
  // kamforms://reponses, kamforms://reponses/[formId]
  useEffect(() => {
    if (!isSignedIn) return;

    const handleUrl = (url: string) => {
      const parsed = parseKamformsLink(url);
      switch (parsed.kind) {
        case "formulaire":
          router.push(`/formulaire/${parsed.id}` as never);
          break;
        case "reponses":
          // Pour l'instant, on ouvre simplement l'onglet Réponses.
          // Le filtrage par formId nécessiterait un paramètre de route — TODO V1.1.
          router.push("/(tabs)/reponses" as never);
          break;
        case "form":
          // Lien public : on l'ouvre dans le navigateur système (WebView non requis,
          // le formulaire public est web-only). Note : on pourrait aussi afficher
          // une feuille modale "Ouvrir le formulaire public ?" avec le lien.
          if (__DEV__) dlog("deeplink", `form/${parsed.slug} — ouverture externe`);
          // Pour MVP, on ne fait rien ici : le formulaire public n'est pas
          // encore implémenté en RN. Le lien https://kamforms.com/f/[slug]
          // reste la voie d'accès publique.
          break;
        case "unknown":
          if (__DEV__) dlog("deeplink", `URL non reconnue: ${parsed.raw}`);
          break;
      }
    };

    // Vérifier les liens en attente (app ouverte via un tap sur le lien)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    }).catch(() => { /* silencieux */ });

    // S'abonner aux liens entrants pendant que l'app tourne
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [isSignedIn, router]);

  // Chargement Clerk : écran de marque au lieu d'une page blanche
  if (!isLoaded) {
    return (
      <View style={splashStyles.container}>
        <KMark size={72} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ink },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth-choice" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="oauth-native-callback" />
      <Stack.Screen name="creer" />
      <Stack.Screen name="onboarding/notifications" />
      <Stack.Screen name="onboarding/checklist" />
      <Stack.Screen name="onboarding/create-form" />
      <Stack.Screen name="onboarding/success" />
      <Stack.Screen name="formulaire/[id]/index" />
      <Stack.Screen name="formulaire/[id]/editer" />
      <Stack.Screen name="parametres-supprimer-compte" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  // ─── Fonts : 5 variants au lieu de 17 (Phase 1.2) ──────────────────
  const [fontsLoaded, fontsError] = useFonts(kamformsFonts);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontsError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  if (clerkKeyMissing) {
    return (
      <View style={styles.missingKey}>
        <StatusBar style="light" />
        <Text style={styles.missingKeyTitle}>Clé Clerk manquante</Text>
        <Text style={styles.missingKeyText}>
          Collez votre vraie clé EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY dans le fichier
          .env, puis rechargez l'application.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  missingKey: {
    flex: 1,
    backgroundColor: "#0B0B0E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  missingKeyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F7F7F5",
    marginBottom: 12,
  },
  missingKeyText: {
    fontSize: 15,
    color: "#9A9AA2",
    textAlign: "center",
    lineHeight: 22,
  },
});
