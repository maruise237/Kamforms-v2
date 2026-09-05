/**
 * Client API Kamforms — consomme l'API REST du SaaS Next.js existant.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://kamforms.com";

// ─── Types ────────────────────────────────────────────────

export type FormSchema = {
  fields: FormField[];
  steps?: { title: string }[];
};

export type FormField = {
  id: string;
  type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "rating";
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export type FormTheme = {
  preset?: string;
  customColor?: string;
  bgColor?: string;
  bannerUrl?: string;
  bannerPosition?: "top" | "center" | "bottom";
};

export type FormEnding = {
  message?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  confetti?: boolean;
};

export type FormSummary = {
  id: string;
  title: string;
  slug: string;
  active: boolean;
  createdAt: string;
  notificationsEnabled: boolean;
  _count: { submissions: number };
};

export type FormDetail = FormSummary & {
  description: string | null;
  schema: FormSchema;
  theme: FormTheme | null;
  ending: FormEnding | null;
  notificationMode: "every" | "milestones" | "first_only" | "daily_digest" | "off";
  assignedWhatsapp: string | null;
  assignedEmail: string | null;
  maxSubmissions: number | null;
  expiresAt: string | null;
};

export type Submission = {
  id: string;
  formId: string;
  createdAt: string;
  data?: Record<string, unknown>;
  answers?: Record<string, unknown>;
};

export type SubmissionsPage = {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
};

export type GeneratedForm = {
  schema: Record<string, unknown> & { title?: string };
  ending?: Record<string, unknown>;
};

export type AnalyticsData = {
  views: number;
  uniqueVisitors: number;
  completionRate: number;
  submissionCount: number;
  countries: { code: string; name: string; count: number }[];
  cities: { name: string; count: number }[];
};

export type UserSettings = {
  whatsappNumber?: string;
  notificationEmail?: string;
  pushEnabled?: boolean;
};

export type PlanInfo = {
  plan: "free" | "pro" | "business";
  status: "active" | "expired" | "canceled";
  period: "monthly" | "annual";
  activeUntil: string;
  usage: {
    forms: { used: number; limit: number };
    notifications: { used: number; limit: number };
    collaborators: { used: number; limit: number };
  };
  analyticsLevel: "standard" | "advanced";
};

export type Template = {
  id: string;
  name: string;
  icon: string;
  fields: FormField[];
};

// ─── Helpers ──────────────────────────────────────────────

type Options = { token: string; method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown };

async function apiFetch<T>(path: string, { token, method = "GET", body }: Options): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const json = await res.json();
      if (json?.error) message = String(json.error);
    } catch { /* ignore */ }
    throw new Error(message);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export function formPublicUrl(slug: string): string {
  return `${API_URL}/f/${slug}`;
}

// ─── Endpoints Forms ──────────────────────────────────────

export const listForms = (token: string) => apiFetch<FormSummary[]>("/api/forms", { token });

export const getForm = (token: string, id: string) => apiFetch<FormDetail>(`/api/forms/${id}`, { token });

export const createForm = (token: string, payload: {
  title: string;
  description?: string | null;
  schema: unknown;
  ending?: Record<string, unknown>;
}) => apiFetch<{ id: string; slug: string }>("/api/forms", { token, method: "POST", body: payload });

export const updateForm = (token: string, id: string, payload: Partial<FormDetail>) =>
  apiFetch<FormDetail>(`/api/forms/${id}`, { token, method: "PATCH", body: payload });

export const deleteForm = (token: string, id: string) =>
  apiFetch<null>(`/api/forms/${id}`, { token, method: "DELETE" });

export const cloneForm = (token: string, id: string) =>
  apiFetch<FormDetail>(`/api/forms/${id}/clone`, { token, method: "POST" });

// ─── Endpoints Submissions ────────────────────────────────

export const listSubmissions = (token: string, formId: string, limit = 10) =>
  apiFetch<SubmissionsPage>(`/api/forms/${formId}/submissions?limit=${limit}`, { token });

export const clearSubmissions = (token: string, formId: string) =>
  apiFetch<null>(`/api/forms/${formId}/submissions`, { token, method: "DELETE" });

/**
 * Export CSV des soumissions (Phase 3.5)
 *
 * L'endpoint /api/forms/[id]/submissions/export renvoie un blob text/csv.
 * On le récupère en mode blob (pas JSON), puis on le sauvegarde via
 * expo-file-system + expo-sharing pour proposer le partage natif.
 *
 * ⚠️ Requiert : npx expo install expo-file-system expo-sharing
 */
export async function exportSubmissionsCsv(
  token: string,
  formId: string
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(`${API_URL}/api/forms/${formId}/submissions/export`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const json = await res.json();
      if (json?.error) msg = String(json.error);
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  const cd = res.headers.get("content-disposition") ?? "";
  const match = cd.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? `kamforms-export-${formId}.csv`;
  const blob = await res.blob();
  return { blob, filename };
}

// ─── Endpoints Generation & Import ────────────────────────

export const generateForm = (token: string, prompt: string, formType?: "single" | "multi") =>
  apiFetch<GeneratedForm>("/api/generate", { token, method: "POST", body: { prompt, formType } });

export const importGoogleForms = (token: string, url: string, formType?: "single" | "multi") =>
  apiFetch<GeneratedForm>("/api/import/google-forms", { token, method: "POST", body: { url, formType } });

// ─── Endpoints Analytics ──────────────────────────────────

export const getFormAnalytics = (token: string, formId: string) =>
  apiFetch<AnalyticsData>(`/api/forms/${formId}/analytics`, { token });

// ─── Endpoints User / Settings ────────────────────────────

export const getUserSettings = (token: string) =>
  apiFetch<UserSettings>("/api/user", { token });

export const updateUserSettings = (token: string, payload: UserSettings) =>
  apiFetch<UserSettings>("/api/user", { token, method: "PATCH", body: payload });

export const getPlanInfo = (token: string) =>
  apiFetch<PlanInfo>("/api/billing/usage", { token });

// ─── Endpoints Notifications ──────────────────────────────

export const registerExpoToken = (token: string, expoPushToken: string, platform: "android" | "ios") =>
  apiFetch("/api/notifications/expo-token", { token, method: "POST", body: { token: expoPushToken, platform } });

// ─── Templates (côté client) ──────────────────────────────

export const FORM_TEMPLATES: Template[] = [
  { id: "contact", name: "Contact", icon: "Mail",
    fields: [{ id: "nom", type: "text", label: "Nom complet", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "message", type: "textarea", label: "Message", required: true }] },
  { id: "devis", name: "Devis", icon: "Banknote",
    fields: [{ id: "nom", type: "text", label: "Nom", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "description", type: "textarea", label: "Description du projet", required: true }, { id: "budget", type: "number", label: "Budget estimé" }] },
  { id: "satisfaction", name: "Satisfaction", icon: "Star",
    fields: [{ id: "note", type: "rating", label: "Note", required: true }, { id: "commentaire", type: "textarea", label: "Commentaire" }] },
  { id: "candidature", name: "Candidature", icon: "Briefcase",
    fields: [{ id: "nom", type: "text", label: "Nom", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "poste", type: "text", label: "Poste visé", required: true }, { id: "motivation", type: "textarea", label: "Lettre de motivation" }] },
  { id: "inscription", name: "Inscription", icon: "CalendarCheck",
    fields: [{ id: "nom", type: "text", label: "Nom", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "date", type: "date", label: "Date souhaitée" }] },
  { id: "newsletter", name: "Newsletter", icon: "Send",
    fields: [{ id: "email", type: "email", label: "Email", required: true }, { id: "prenom", type: "text", label: "Prénom" }] },
  { id: "lead", name: "Lead", icon: "Target",
    fields: [{ id: "nom", type: "text", label: "Nom", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "telephone", type: "phone", label: "Téléphone" }, { id: "besoin", type: "textarea", label: "Description du besoin" }] },
  { id: "feedback-produit", name: "Feedback Produit", icon: "MessageSquare",
    fields: [{ id: "produit", type: "text", label: "Produit", required: true }, { id: "note", type: "rating", label: "Note", required: true }, { id: "avis", type: "textarea", label: "Votre avis" }] },
  { id: "rdv", name: "Prise de RDV", icon: "CalendarDays",
    fields: [{ id: "nom", type: "text", label: "Nom", required: true }, { id: "email", type: "email", label: "Email", required: true }, { id: "date", type: "date", label: "Date souhaitée", required: true }, { id: "creneau", type: "select", label: "Créneau", options: ["Matin (9h-12h)", "Après-midi (14h-17h)", "Soir (17h-19h)"] }] },
];
