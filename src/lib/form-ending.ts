export interface FormEnding {
  message?: string      // Main heading   — default: "Réponse enregistrée"
  description?: string  // Sub-text       — default: "Vous pouvez fermer cette page."
  buttonLabel?: string  // Redirect button label (omit = no button)
  buttonUrl?: string    // Redirect URL
  confetti?: boolean    // Celebration confetti on submission (default: true)
}
