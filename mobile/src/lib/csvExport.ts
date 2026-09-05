/**
 * Helper d'export CSV (Phase 3.5)
 *
 * Télécharge le blob CSV depuis l'API, le sauvegarde sur le système de fichiers
 * via expo-file-system, puis ouvre la feuille de partage natif via expo-sharing.
 *
 * Flux :
 *   1. GET /api/forms/[id]/submissions/export → blob
 *   2. Blob → ArrayBuffer → base64 (nécessaire pour expo-file-system sur mobile)
 *   3. Écriture dans FileSystem.cacheDirectory + filename
 *   4. Sharing.shareAsync() → ouvre le menu Partager du système
 */

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { exportSubmissionsCsv } from "./api";

export type ExportResult = {
  ok: boolean;
  fileUri?: string;
  filename?: string;
  error?: string;
};

/**
 * Convertit un Blob en base64 (requis par expo-file-system writeAsStringAsync)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      // Le format est "data:text/csv;base64,...." — on extrait juste le base64
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Exporte et partage le CSV des soumissions d'un formulaire.
 *
 * @param token Token Clerk (Bearer)
 * @param formId ID du formulaire
 * @returns { ok, fileUri, filename, error }
 */
export async function exportAndShareSubmissionsCsv(
  token: string,
  formId: string
): Promise<ExportResult> {
  try {
    // 1. Télécharger le CSV depuis l'API
    const { blob, filename } = await exportSubmissionsCsv(token, formId);

    // 2. Convertir en base64
    const base64 = await blobToBase64(blob);

    // 3. Écrire dans le cache (répertoire temporaire accessible au système)
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      return { ok: false, error: "Répertoire de cache non disponible." };
    }
    const fileUri = `${cacheDir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4. Vérifier que Sharing est disponible (cas rare : mode kiosque iOS)
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        ok: false,
        error: "Le partage n'est pas disponible sur cet appareil.",
        fileUri,
        filename,
      };
    }

    // 5. Ouvrir la feuille de partage native
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: `Exporter les réponses — ${filename}`,
      UTI: "public.comma-separated-values-text",
    });

    return { ok: true, fileUri, filename };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur lors de l'export CSV",
    };
  }
}

/**
 * Vérifie si un fichier temporaire d'export existe déjà (pour éviter de
 * re-télécharger si l'utilisateur veut le partager à nouveau).
 */
export async function getCachedExportUri(filename: string): Promise<string | null> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) return null;
  const uri = `${cacheDir}${filename}`;
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? uri : null;
}

/**
 * Nettoie tous les fichiers CSV temporaires (à appeler au logout par ex.).
 */
export async function clearExportCache(): Promise<void> {
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return;
    const files = await FileSystem.readDirectoryAsync(cacheDir);
    await Promise.all(
      files
        .filter((f) => f.endsWith(".csv"))
        .map((f) => FileSystem.deleteAsync(`${cacheDir}${f}`, { idempotent: true }))
    );
  } catch {
    // Silencieux — peut échouer si le cache n'existe pas encore
  }
}
