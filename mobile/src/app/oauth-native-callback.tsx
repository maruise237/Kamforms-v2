import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";

import { useTheme } from "@/context/ThemeContext";
import { dlog } from "@/lib/debugLog";

/**
 * Route de retour OAuth (Google / Apple).
 * L'URL kamforms://oauth-native-callback doit rester propre (sans
 * parenthèses) pour qu'Android puisse la router vers l'app.
 *
 * Cas nominal : expo-web-browser intercepte l'URL, l'écran ne s'affiche
 * qu'un instant et le hook useOAuth active la session.
 *
 * Cas de secours : si l'OS a tué l'app pendant le passage dans Chrome
 * (fréquent en APK release), l'app redémarre directement sur cette route
 * et la promesse useOAuth n'existe plus. On recharge alors signIn/signUp
 * depuis le serveur Clerk : si la session a été créée pendant le flux
 * navigateur, on l'active ici et on entre dans l'app.
 */
export default function OAuthNativeCallback() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const handled = useRef(false);

  // Session déjà active (reprise à chaud) → entrée directe
  useEffect(() => {
    if (isLoaded && isSignedIn && !handled.current) {
      handled.current = true;
      router.replace("/(tabs)" as never);
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!signInLoaded || !signUpLoaded || handled.current) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    dlog("callback", `secours démarré signIn=${signIn?.status ?? "null"} signUp=${signUp?.status ?? "null"}`);

    (async () => {
      try {
        const attempts = [
          { resource: signIn, setActive: setActiveSignIn },
          { resource: signUp, setActive: setActiveSignUp },
        ] as const;
        for (const { resource, setActive } of attempts) {
          if (!resource || cancelled || handled.current) continue;
          const reloaded = await resource.reload();
          dlog("callback", `reload statut=${reloaded.status} session=${reloaded.createdSessionId ? "oui" : "non"}`);
          if (reloaded.status === "complete" && reloaded.createdSessionId && setActive) {
            handled.current = true;
            await setActive({ session: reloaded.createdSessionId });
            dlog("callback", "secours réussi → navigation vers les onglets");
            router.replace("/(tabs)" as never);
            return;
          }
        }
      } catch (err) {
        dlog("callback", `ERREUR secours: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Délai de grâce : si ni le flux nominal ni le secours n'aboutissent,
      // on renvoie vers l'écran de connexion au lieu d'un spinner infini.
      timeout = setTimeout(() => {
        if (!cancelled && !handled.current) {
          dlog("callback", "délai dépassé (8s), aucune session → retour à auth-choice");
          router.replace("/auth-choice" as never);
        }
      }, 8000);
    })();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [signInLoaded, signUpLoaded, signIn, signUp, setActiveSignIn, setActiveSignUp, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.ink }]}>
      <ActivityIndicator color={colors.signal} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
