// Layout isolé pour les formulaires publics.
// Pas de script manipulant .dark sur <html> — PublicFormWrapper gère le thème
// localement via sa propre classe .dark et .auto-theme (media query CSS).
// Aucune classe dark: Tailwind n'est utilisée dans les composants publics,
// donc le flash de thème est impossible.
export default function PublicFormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
