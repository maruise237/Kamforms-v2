import OpenAI from 'openai'
import { formSchemaSchema, type FormSchema, type FormField } from './form-schema'
import type { FormEnding } from './form-ending'
import {
  type GenerateResult,
  type Op,
  parseResult,
  parseOps,
  resolveFieldId,
  applyOperations,
} from './deepseek-parse'

export type { GenerateResult }

function getClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: 'https://api.deepseek.com',
    timeout: 25_000,
  })
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const PROMPT_SINGLE = `Tu es un expert en conception de formulaires UX.
Génère un schéma JSON de formulaire (page unique) à partir de la description de l'utilisateur.
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication.

Format exact :
{
  "description": "Courte description du formulaire affichée sous le titre (1-2 phrases, optionnel)",
  "fields": [
    {
      "id": "field_1",
      "type": "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "rating",
      "label": "Libellé du champ",
      "description": "Texte d'aide affiché sous le libellé (optionnel, 1 phrase max)",
      "placeholder": "Texte grisé dans le champ (optionnel)",
      "required": true,
      "options": ["Option 1", "Option 2"],
      "condition": { "fieldId": "field_X", "value": "valeur attendue" }
    }
  ],
  "ending": {
    "message": "Message principal affiché après soumission",
    "description": "Texte secondaire optionnel",
    "buttonLabel": "Texte du bouton de redirection (optionnel)",
    "buttonUrl": "https://... (optionnel, seulement avec buttonLabel)"
  }
}

Règles sur les champs :
- Maximum 8 champs
- Toujours "Nom complet" (text, required) et "Email" (email, required) en premier
- IDs séquentiels : field_1, field_2, etc.
- "description" : ajoute une explication si le champ peut prêter à confusion (format attendu, pourquoi demandé, exemple). Omets si évident.
- "options" uniquement pour select et radio
- "checkbox" : case à cocher oui/non, "placeholder" = texte à côté de la case (ex: "J'accepte les conditions")
- "date" : sélecteur de date
- "rating" : note de 1 à 5 étoiles (pas besoin de "options")
- "condition" optionnel, pour la logique conditionnelle
- Adapte au contexte métier décrit

Règles sur le message de fin :
- Génère toujours un ending adapté au contexte métier (ex: "Merci pour votre inscription !", "Votre demande a bien été reçue.")
- "description" : délai de réponse, prochaines étapes, ou encouragement selon le contexte
- "buttonLabel" + "buttonUrl" : seulement si un site web ou une prochaine action est mentionné dans la description`

const PROMPT_MULTI = `Tu es un expert en conception de formulaires UX.
Génère un schéma JSON de formulaire multi-étapes à partir de la description de l'utilisateur.
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication.

Format exact :
{
  "description": "Courte description du formulaire affichée sous le titre (1-2 phrases, optionnel)",
  "steps": [
    {"title": "Titre de l'étape 1"},
    {"title": "Titre de l'étape 2"}
  ],
  "fields": [
    {
      "id": "field_1",
      "step": 1,
      "type": "text" | "email" | "phone" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "rating",
      "label": "Libellé du champ",
      "description": "Texte d'aide affiché sous le libellé (optionnel, 1 phrase max)",
      "placeholder": "Texte grisé dans le champ (optionnel)",
      "required": true,
      "options": ["Option 1", "Option 2"],
      "condition": { "fieldId": "field_X", "value": "valeur attendue" }
    }
  ],
  "ending": {
    "message": "Message principal affiché après soumission",
    "description": "Texte secondaire optionnel",
    "buttonLabel": "Texte du bouton de redirection (optionnel)",
    "buttonUrl": "https://... (optionnel, seulement avec buttonLabel)"
  }
}

Règles sur les champs :
- 2 à 4 étapes selon la complexité
- 2 à 4 champs par étape maximum
- Chaque champ DOIT avoir un numéro d'étape (step, commence à 1)
- Étape 1 : toujours "Nom complet" (text, required) et "Email" (email, required) en premier
- IDs séquentiels : field_1, field_2, etc.
- "description" : ajoute une explication si le champ peut prêter à confusion (format attendu, pourquoi demandé, exemple). Omets si évident.
- "options" uniquement pour select et radio
- "checkbox" : case à cocher oui/non, "placeholder" = texte à côté de la case
- "date" : sélecteur de date
- "rating" : note de 1 à 5 (pas besoin de "options")
- "condition" optionnel, pour la logique conditionnelle
- Titres d'étapes orientés métier (ex: "Votre profil", "Votre projet", "Budget & délais")
- Adapte au contexte métier décrit

Règles sur le message de fin :
- Génère toujours un ending adapté au contexte métier
- "description" : délai de réponse, prochaines étapes, ou encouragement selon le contexte
- "buttonLabel" + "buttonUrl" : seulement si un site web ou une prochaine action est mentionné`

const PROMPT_MODIFY = `Tu es un assistant IA intégré dans un éditeur de formulaires. L'utilisateur te décrit en langage naturel ce qu'il veut modifier.
Réponds UNIQUEMENT avec un objet JSON ayant la clé "operations" contenant les opérations à appliquer.
Ne retourne PAS le schéma complet. N'inclus QUE les opérations nécessaires.

Format de réponse OBLIGATOIRE :
{ "operations": [ ...liste d'opérations... ] }

IMPORTANT — Référencer un champ : utilise le libellé du champ (ex: "Email", "Nom complet") OU son ID (ex: "field_2"). Les deux sont acceptés. Préfère le libellé.

Opérations disponibles :

1. Modifier un champ existant :
{ "op": "update_field", "id": "Libellé ou field_X", "changes": { ...uniquement les propriétés à changer... } }

2. Ajouter un nouveau champ :
{ "op": "add_field", "after_id": "Libellé ou field_X", "step": N, "field": { "id": "field_new_1", "type": "...", "label": "...", "required": false, "placeholder": "...", "options": [...] } }
(step uniquement pour les formulaires multi-étapes, after_id optionnel)

3. Supprimer un champ :
{ "op": "delete_field", "id": "Libellé ou field_X" }

4. Modifier le message de fin :
{ "op": "update_ending", "changes": { "message": "...", "description": "...", "buttonLabel": "...", "buttonUrl": "..." } }

5. Modifier le titre d'une étape (multi-étapes) :
{ "op": "update_step", "step": N, "changes": { "title": "..." } }

Types de champ valides : text, email, phone, number, textarea, select, radio, checkbox, date, rating
Propriétés d'un champ :
- "label" : titre du champ
- "description" : texte d'aide affiché sous le libellé. Utilise TOUJOURS "description" quand l'utilisateur demande d'ajouter/modifier une description, explication ou texte d'aide pour un champ.
- "placeholder" : texte grisé à l'intérieur du champ de saisie
- "required" : booléen
- "options" : tableau de strings, uniquement pour select et radio

Exemples (utilise les libellés — plus simple) :
- "ajoute une description au champ email" → { "operations": [{ "op": "update_field", "id": "Email", "changes": { "description": "Nous utiliserons cet email pour vous contacter." } }] }
- "rends le champ téléphone optionnel" → { "operations": [{ "op": "update_field", "id": "Téléphone", "changes": { "required": false } }] }
- "ajoute un champ budget après email" → { "operations": [{ "op": "add_field", "after_id": "Email", "field": { "id": "field_new_1", "type": "select", "label": "Budget", "required": false, "options": ["-1000€", "1000-5000€", "+5000€"] } }] }
- "supprime le champ téléphone" → { "operations": [{ "op": "delete_field", "id": "Téléphone" }] }
- "rends tous les champs obligatoires" → { "operations": [une opération update_field par champ avec "required": true] }

Si aucune modification n'est nécessaire → { "operations": [] }`

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callAI(system: string, user: string, jsonMode = false): Promise<string> {
  const completion = await getClient().chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  })
  const raw = completion.choices[0]?.message?.content
  if (!raw) throw new Error('Empty response from Deepseek')
  return raw
}

// ─── Field map helper (gives the AI an explicit ID→label index) ───────────────

function buildFieldMap(schema: FormSchema): string {
  return schema.fields.map(f => {
    const step = f.step ? `, étape ${f.step}` : ''
    const req  = f.required ? ' [requis]' : ' [optionnel]'
    const opts = f.options?.length ? ` — options: [${f.options.join(', ')}]` : ''
    const desc = f.description ? ` — description actuelle: "${f.description}"` : ''
    return `- ${f.id} → "${f.label}" (${f.type}${step})${req}${opts}${desc}`
  }).join('\n')
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateFormSchema(
  prompt: string,
  multiStep = false,
): Promise<GenerateResult> {
  try {
    const raw = await callAI(multiStep ? PROMPT_MULTI : PROMPT_SINGLE, prompt)
    return parseResult(raw)
  } catch {
    throw new Error("Le schéma généré par l'IA est invalide. Veuillez réessayer.")
  }
}

export async function modifyFormSchema(
  currentSchema: FormSchema,
  prompt: string,
  currentEnding?: FormEnding,
): Promise<GenerateResult> {
  const context = `CHAMPS DISPONIBLES (utilise exactement ces IDs dans les opérations) :
${buildFieldMap(currentSchema)}

Schéma JSON complet (référence) :
${JSON.stringify(currentSchema, null, 2)}${
    currentEnding ? `\n\nMessage de fin actuel :\n${JSON.stringify(currentEnding, null, 2)}` : ''
  }

Instruction : ${prompt}`

  try {
    const raw = await callAI(PROMPT_MODIFY, context, true)
    const ops = parseOps(raw)

    if (ops.length === 0) {
      return { schema: currentSchema, ending: currentEnding }
    }

    const result = applyOperations(currentSchema, ops, currentEnding)

    // Detect silent no-op: ops generated but no field matched (wrong IDs)
    const schemaChanged =
      JSON.stringify(result.schema.fields) !== JSON.stringify(currentSchema.fields) ||
      JSON.stringify(result.ending) !== JSON.stringify(currentEnding)

    if (!schemaChanged) {
      throw new Error(
        "Aucun champ modifié — l'instruction n'a pas pu être appliquée. " +
        "Reformulez en mentionnant le nom du champ concerné (ex: \"rends l'Email obligatoire\", \"ajoute une description au champ Budget\")."
      )
    }

    // Validate the resulting schema
    const validated = formSchemaSchema.safeParse(result.schema)
    if (!validated.success) {
      throw new Error(`Schéma résultant invalide : ${validated.error.issues[0]?.message}`)
    }

    return { schema: validated.data, ending: result.ending }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    throw new Error(`La modification a échoué : ${msg}`)
  }
}
