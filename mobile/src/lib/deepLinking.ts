/**
 * Helper de parsing des liens kamforms:// (Phase 3.7)
 *
 * Schémas supportés :
 *   kamforms://form/[slug]        → ouvre le formulaire public (dans le navigateur)
 *   kamforms://formulaire/[id]   → ouvre l'éditeur du formulaire (app)
 *   kamforms://reponses          → ouvre l'onglet Réponses
 *   kamforms://reponses/[formId] → ouvre l'onglet Réponses filtré sur un form
 *   kamforms://oauth-native-callback (déjà géré par Clerk)
 *
 * Format des routes expo-router correspondant :
 *   /formulaire/[id]/index.tsx   → détail/éditeur d'un formulaire
 *   /(tabs)/reponses             → onglet Réponses
 */

import * as Linking from "expo-linking";

export type ParsedDeepLink =
  | { kind: "form"; slug: string }
  | { kind: "formulaire"; id: string }
  | { kind: "reponses"; formId?: string }
  | { kind: "unknown"; raw: string };

/**
 * Parse une URL kamforms://... en objet structuré.
 */
export function parseKamformsLink(url: string): ParsedDeepLink {
  // Linking.parse retourne { path, query, scheme, host }
  const parsed = Linking.parse(url);
  const host = parsed.hostname ?? "";
  const pathSegments = (parsed.path ?? "").split("/").filter(Boolean);

  switch (host) {
    case "form":
      // kamforms://form/[slug] → slug est dans pathSegments[0]
      if (pathSegments[0]) {
        return { kind: "form", slug: decodeURIComponent(pathSegments[0]) };
      }
      return { kind: "unknown", raw: url };

    case "formulaire":
      // kamforms://formulaire/[id]
      if (pathSegments[0]) {
        return { kind: "formulaire", id: pathSegments[0] };
      }
      return { kind: "unknown", raw: url };

    case "reponses":
      // kamforms://reponses  OU  kamforms://reponses/[formId]
      return { kind: "reponses", formId: pathSegments[0] };

    case "oauth-native-callback":
      // Déjà géré par Clerk, on l'ignore ici
      return { kind: "unknown", raw: url };

    default:
      return { kind: "unknown", raw: url };
  }
}

/**
 * Génère une URL de partage pour un formulaire public.
 * Format : kamforms://form/[slug]
 *
 * Note : ce schéma n'est utilisable QUE si l'utilisateur a l'app installée.
 * Pour le partage multi-canal (mail, WhatsApp), utiliser plutôt https://kamforms.com/f/[slug].
 */
export function buildFormDeepLink(slug: string): string {
  return `kamforms://form/${encodeURIComponent(slug)}`;
}

/**
 * Génère une URL de partage pour l'éditeur d'un formulaire (interne à l'app).
 */
export function buildFormulaireDeepLink(id: string): string {
  return `kamforms://formulaire/${id}`;
}
