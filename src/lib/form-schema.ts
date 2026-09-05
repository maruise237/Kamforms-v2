import { z } from 'zod'

export const fieldTypeSchema = z.enum([
  'text', 'email', 'phone', 'number', 'textarea', 'select', 'radio',
  'checkbox', 'date', 'rating',
])

const formFieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string(),
  description: z.string().optional(),   // help text shown below the label
  placeholder: z.string().optional(),   // hint text inside the input
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  condition: z.object({
    fieldId: z.string(),
    value: z.string(),
  }).optional(),
  step: z.number().int().min(1).optional(),
})

const stepSchema = z.object({
  title: z.string(),
})

export const formSchemaSchema = z.object({
  fields: z.array(formFieldSchema),
  steps: z.array(stepSchema).optional(),
})

export type FieldType = z.infer<typeof fieldTypeSchema>
export type FormField = z.infer<typeof formFieldSchema>
export type FormSchema = z.infer<typeof formSchemaSchema>
type Step = z.infer<typeof stepSchema>
