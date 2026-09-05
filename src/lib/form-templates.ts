import type { FormSchema } from './form-schema'

export interface FormTemplate {
  id: string
  name: string
  description: string
  icon: string
  schema: FormSchema
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    name: 'Contact',
    description: 'Nom, email, téléphone, message',
    icon: 'Mail',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',     label: 'Nom complet',  placeholder: 'Jean Dupont',              required: true  },
        { id: 'field_2', type: 'email',    label: 'Email',        placeholder: 'jean@exemple.com',         required: true  },
        { id: 'field_3', type: 'phone',    label: 'Téléphone',    placeholder: '+33 6 12 34 56 78',        required: false },
        { id: 'field_4', type: 'textarea', label: 'Message',      placeholder: 'Comment pouvons-nous vous aider ?', required: true  },
      ],
    },
  },
  {
    id: 'devis',
    name: 'Demande de devis',
    description: 'Qualification prospect + budget + projet',
    icon: 'Banknote',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',     label: 'Nom complet',       required: true  },
        { id: 'field_2', type: 'email',    label: 'Email',             required: true  },
        { id: 'field_3', type: 'phone',    label: 'Téléphone',         required: true  },
        { id: 'field_4', type: 'text',     label: 'Entreprise',        required: false },
        { id: 'field_5', type: 'select',   label: 'Budget estimé',     required: true,  options: ['< 500 €', '500 € – 2 000 €', '2 000 € – 10 000 €', '> 10 000 €'] },
        { id: 'field_6', type: 'textarea', label: 'Décrivez votre projet', placeholder: 'Objectifs, délai, contraintes…', required: true },
      ],
    },
  },
  {
    id: 'satisfaction',
    name: 'Satisfaction client',
    description: 'Évaluation après prestation ou achat',
    icon: 'Star',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',     label: 'Nom',               required: false },
        { id: 'field_2', type: 'email',    label: 'Email',             required: false },
        { id: 'field_3', type: 'radio',    label: 'Note globale',      required: true,  options: ['1 – Très insatisfait', '2 – Insatisfait', '3 – Neutre', '4 – Satisfait', '5 – Très satisfait'] },
        { id: 'field_4', type: 'radio',    label: 'Recommanderiez-vous nos services ?', required: true, options: ['Oui', 'Non', 'Peut-être'] },
        { id: 'field_5', type: 'textarea', label: 'Commentaires et suggestions', placeholder: 'Dites-nous ce que vous pensez…', required: false },
      ],
    },
  },
  {
    id: 'candidature',
    name: 'Candidature emploi',
    description: 'Formulaire de recrutement complet',
    icon: 'Briefcase',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',     label: 'Nom complet',           required: true  },
        { id: 'field_2', type: 'email',    label: 'Email',                 required: true  },
        { id: 'field_3', type: 'phone',    label: 'Téléphone',             required: true  },
        { id: 'field_4', type: 'select',   label: 'Poste souhaité',        required: true,  options: ['Développeur', 'Designer', 'Commercial', 'Marketing', 'Chef de projet', 'Autre'] },
        { id: 'field_5', type: 'select',   label: 'Années d\'expérience',  required: true,  options: ['Moins de 1 an', '1 – 3 ans', '3 – 5 ans', 'Plus de 5 ans'] },
        { id: 'field_6', type: 'textarea', label: 'Lettre de motivation',  placeholder: 'Pourquoi postuler chez nous ?', required: true },
      ],
    },
  },
  {
    id: 'inscription',
    name: 'Inscription événement',
    description: 'Gestion des participations',
    icon: 'CalendarCheck',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',   label: 'Nom complet',          required: true  },
        { id: 'field_2', type: 'email',  label: 'Email',                required: true  },
        { id: 'field_3', type: 'phone',  label: 'Téléphone',            required: false },
        { id: 'field_4', type: 'number', label: 'Nombre de participants', placeholder: '1', required: true },
        { id: 'field_5', type: 'radio',  label: 'Régime alimentaire',   required: false, options: ['Standard', 'Végétarien', 'Végétalien', 'Sans gluten'] },
      ],
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Inscription à une liste de diffusion',
    icon: 'Send',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',   label: 'Prénom',           required: true  },
        { id: 'field_2', type: 'email',  label: 'Email',            required: true  },
        { id: 'field_3', type: 'select', label: 'Centre d\'intérêt', required: false, options: ['Actualités', 'Promotions', 'Nouveautés produit', 'Conseils & astuces'] },
      ],
    },
  },
  {
    id: 'lead',
    name: 'Génération de leads',
    description: 'Qualification de prospects B2B',
    icon: 'Target',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',   label: 'Prénom & Nom',            required: true  },
        { id: 'field_2', type: 'email',  label: 'Email professionnel',     required: true  },
        { id: 'field_3', type: 'text',   label: 'Entreprise',              required: true  },
        { id: 'field_4', type: 'select', label: 'Taille de l\'entreprise', required: true,  options: ['1 – 10 employés', '11 – 50 employés', '51 – 200 employés', '200+ employés'] },
        { id: 'field_5', type: 'select', label: 'Besoin principal',        required: true,  options: ['Automatisation', 'Gestion de données', 'Communication', 'Gestion de projet', 'Autre'] },
      ],
    },
  },
  {
    id: 'feedback',
    name: 'Feedback produit',
    description: 'Retours utilisateurs sur un produit',
    icon: 'MessageSquare',
    schema: {
      fields: [
        { id: 'field_1', type: 'email',    label: 'Email',                             required: false },
        { id: 'field_2', type: 'radio',    label: 'Facilité d\'utilisation',           required: true,  options: ['Très difficile', 'Difficile', 'Neutre', 'Facile', 'Très facile'] },
        { id: 'field_3', type: 'radio',    label: 'Satisfaction générale',             required: true,  options: ['1 étoile', '2 étoiles', '3 étoiles', '4 étoiles', '5 étoiles'] },
        { id: 'field_4', type: 'textarea', label: 'Ce qui vous a le plus plu',         required: false },
        { id: 'field_5', type: 'textarea', label: 'Ce qui pourrait être amélioré',     required: false },
      ],
    },
  },
  {
    id: 'rdv',
    name: 'Prise de rendez-vous',
    description: 'Demande de rendez-vous avec créneaux',
    icon: 'CalendarDays',
    schema: {
      fields: [
        { id: 'field_1', type: 'text',     label: 'Nom complet',        required: true  },
        { id: 'field_2', type: 'email',    label: 'Email',              required: true  },
        { id: 'field_3', type: 'phone',    label: 'Téléphone',          required: true  },
        { id: 'field_4', type: 'select',   label: 'Type de rendez-vous', required: true, options: ['Consultation initiale', 'Suivi', 'Urgence', 'Autre'] },
        { id: 'field_5', type: 'radio',    label: 'Créneau préféré',    required: true,  options: ['Matin (8h – 12h)', 'Après-midi (13h – 17h)', 'Soir (17h – 20h)'] },
        { id: 'field_6', type: 'textarea', label: 'Motif de la demande', required: false },
      ],
    },
  },
]
