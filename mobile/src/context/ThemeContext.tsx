import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { darkColors, lightColors } from "@/theme";

const STORAGE_KEY = "kamforms_theme_mode";

export type ThemeMode = "system" | "light" | "dark";

/**
 * Type plus souple qui accepte les deux palettes.
 * On utilise `typeof darkColors` comme base mais on étend avec `typeof lightColors`.
 */
type Palette = { [K in keyof typeof darkColors]: string };

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function loadPreference(): Promise<ThemeMode> {
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* silencieux */ }
  return "system";
}

function savePreference(mode: ThemeMode) {
  try {
    if (mode === "system") {
      SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
    } else {
      SecureStore.setItemAsync(STORAGE_KEY, mode).catch(() => {});
    }
  } catch { /* silencieux */ }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    loadPreference().then(setModeState);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    savePreference(next);
  }, []);

  // isDark calculé avant toggle pour éviter l'erreur "used before declaration"
  const isDark = useMemo(() => {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return systemScheme === "dark";
  }, [mode, systemScheme]);

  const toggle = useCallback(() => {
    setMode(isDark ? "light" : "dark");
  }, [isDark, setMode]);

  const colors: Palette = isDark ? darkColors : lightColors;

  const value: ThemeContextValue = { mode, isDark, colors, setMode, toggle };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans un ThemeProvider");
  return ctx;
}

export default ThemeContext;
