import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { dlog } from "@/lib/debugLog";

if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export type SocialProvider = "google" | "apple";

/**
 * Flux OAuth Google / Apple centralisé.
 *
 * - Construit une URL de retour propre (kamforms://oauth-native-callback),
 *   sans parenthèses pour qu'Android la route correctement vers l'app.
 * - Remonte les VRAIES erreurs Clerk à l'écran (indispensable pour
 *   diagnoster les échecs en APK release, où le flux passe par un
 *   onglet Chrome et peut être tué par l'OS).
 */
export function useSocialAuth() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Préchauffage du navigateur pour une ouverture rapide
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: "oauth_apple" });

  const startSocialLogin = useCallback(
    async (provider: SocialProvider) => {
      setLoadingProvider(provider);
      setErrorMessage(null);
      try {
        const startFlow = provider === "google" ? startGoogleFlow : startAppleFlow;
        const redirectUrl = Linking.createURL("/oauth-native-callback", { scheme: "kamforms" });
        dlog("oauth", `démarrage ${provider} redirectUrl=${redirectUrl}`);

        const { createdSessionId, setActive, signIn, signUp } = await startFlow({ redirectUrl });
        dlog(
          "oauth",
          `retour ${provider} session=${createdSessionId ? "oui" : "non"} ` +
            `signIn=${signIn?.status ?? "-"} signUp=${signUp?.status ?? "-"}`
        );

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          dlog("oauth", "setActive OK → navigation vers les onglets");
          router.replace("/(tabs)" as never);
          return;
        }

        // Pas de session : annulation utilisateur ou étape Clerk manquante.
        // On le dit clairement au lieu de rester silencieux (spinner infini).
        const pending = signUp?.status === "missing_requirements" || signIn?.status === "needs_first_factor";
        setErrorMessage(
          pending
            ? "Connexion incomplète — Clerk demande une étape supplémentaire. Réessayez ou utilisez l'email."
            : "Connexion annulée ou interrompue. Réessayez."
        );
      } catch (err: unknown) {
        const clerkMessage =
          err && typeof err === "object" && "errors" in err
            ? (err as { errors?: { longMessage?: string; message?: string }[] }).errors?.[0]?.longMessage ??
              (err as { errors?: { message?: string }[] }).errors?.[0]?.message
            : undefined;
        const raw = clerkMessage ?? (err instanceof Error ? err.message : String(err));
        dlog("oauth", `ERREUR ${provider}: ${raw}`);
        if (!/cancel|dismiss/i.test(raw)) {
          const label = provider === "google" ? "Google" : "Apple";
          // Message complet affiché volontairement : c'est notre seule
          // source de diagnostic sur l'APK release.
          setErrorMessage(`${label} : ${raw}`);
        }
      } finally {
        setLoadingProvider(null);
      }
    },
    [startGoogleFlow, startAppleFlow, router]
  );

  return { startSocialLogin, loadingProvider, errorMessage, clearError: () => setErrorMessage(null) };
}

/**
 * Redirige vers les onglets si l'utilisateur est déjà connecté.
 * Filet de sécurité : si la navigation post-OAuth échoue alors que la
 * session est active, l'écran de connexion ne reste pas affiché.
 */
export function useRedirectIfSignedIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      dlog("auth", "session active détectée → redirection vers les onglets");
      router.replace("/(tabs)" as never);
    }
  }, [isLoaded, isSignedIn, router]);
}
