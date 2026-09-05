/**
 * Journal de diagnostic en mémoire — consultable depuis le panneau Debug
 * intégré à l'app. Sert à comprendre les échecs de connexion sur l'APK
 * release, où nous n'avons pas accès à la console Metro/logcat.
 */

export type DebugEntry = { at: string; tag: string; msg: string };

const MAX_ENTRIES = 300;
const entries: DebugEntry[] = [];
const listeners = new Set<() => void>();

export function dlog(tag: string, msg: string) {
  console.log(`[${tag}] ${msg}`);
  entries.push({ at: new Date().toISOString().slice(11, 19), tag, msg });
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  listeners.forEach((l) => l());
}

export function getDebugEntries(): DebugEntry[] {
  return entries;
}

export function clearDebugEntries() {
  entries.length = 0;
  listeners.forEach((l) => l());
}

export function subscribeDebug(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
