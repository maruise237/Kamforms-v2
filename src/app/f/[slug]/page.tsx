import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FormRenderer } from '@/components/form-renderer'
import type { FormSchema } from '@/lib/form-schema'
import type { FormTheme } from '@/lib/form-theme'
import { resolveThemeColor, contrastColor } from '@/lib/form-theme'
import type { FormEnding } from '@/lib/form-ending'
import { PublicFormWrapper } from '@/components/public-form-wrapper'
import type { Metadata } from 'next'
import { getSubscriptionUsage } from '@/lib/subscription'

export const revalidate = 60

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const form = await prisma.form.findUnique({
    where: { slug },
    select: { title: true, description: true, theme: true, active: true },
  })
  if (!form || !form.active) return { title: 'Formulaire introuvable', robots: { index: false } }
  const theme = (form.theme ?? {}) as FormTheme
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return {
    title: form.title,
    description: form.description || `Remplissez le formulaire ${form.title} en ligne.`,
    robots: { index: true, follow: true },
    openGraph: {
      title: form.title,
      description: form.description || `Répondez au formulaire ${form.title} en ligne.`,
      url: `${appUrl}/f/${slug}`,
      images: theme.bannerUrl ? [{ url: theme.bannerUrl.startsWith('http') ? theme.bannerUrl : `${appUrl}${theme.bannerUrl}` }] : [],
    },
  }
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const form = await prisma.form.findUnique({ where: { slug } })

  if (!form || !form.active) notFound()
  await getSubscriptionUsage(form.userId)
  const activeAfterPlanCheck = await prisma.form.findUnique({
    where: { id: form.id },
    select: { active: true },
  })
  if (!activeAfterPlanCheck?.active) notFound()

  const theme      = (form.theme ?? {}) as FormTheme
  const themeColor = resolveThemeColor(theme)
  const themeFg    = contrastColor(themeColor)
  const bgColor    = theme.bgColor || undefined

  const schema      = form.schema  as unknown as FormSchema
  const ending      = (form.ending ?? null) as FormEnding | null
  const isMultiStep =
    schema.fields.some((f: { step?: number }) => f.step !== undefined) ||
    ((schema.steps?.length ?? 0) > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: form.title,
    description: form.description,
  }

  /* ── Multi-step: full-screen immersive layout ─────────────────────── */
  if (isMultiStep) {
    return (
      <PublicFormWrapper bgColor={bgColor} className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Banner */}
        {theme.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.bannerUrl}
            alt=""
            className="w-full block shrink-0"
            style={{
              height: 'auto',
              maxHeight: '320px',
              objectFit: 'cover',
              objectPosition: `center ${theme.bannerPosition ?? 'center'}`,
            }}
            fetchPriority="high"
          />
        )}

        {/* Vertically centred form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">
            <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                {form.description}
              </p>
            )}

            <FormRenderer
              schema={schema}
              formSlug={form.slug}
              themeColor={themeColor}
              themeFg={themeFg}
              ending={ending}
            />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/30 pb-6">
          Propulsé par{' '}
          <a href="https://kamforms.kamtech.online/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/60 transition-colors underline-offset-2 hover:underline">Kamforms</a>
          {' · '}
          <a href="https://kamtech.online" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/60 transition-colors underline-offset-2 hover:underline">Kamtech</a>
        </p>
      </PublicFormWrapper>
    )
  }

  /* ── Single-page: standard layout ────────────────────────────────── */
  return (
    <PublicFormWrapper bgColor={bgColor} className="min-h-screen flex flex-col items-center pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Banner */}
      {theme.bannerUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.bannerUrl}
          alt=""
          className="w-full block"
          style={{
            height: 'auto',
            maxHeight: '320px',
            objectFit: 'cover',
            objectPosition: `center ${theme.bannerPosition ?? 'center'}`,
          }}
          fetchPriority="high"
        />
      )}

      <div className={`w-full max-w-lg px-6 ${theme.bannerUrl ? 'pt-8' : 'pt-16'}`}>
        <h1 className="text-xl font-semibold text-foreground mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-sm text-muted-foreground mb-8">{form.description}</p>
        )}
        <FormRenderer
          schema={schema}
          formSlug={form.slug}
          themeColor={themeColor}
          themeFg={themeFg}
          ending={ending}
        />
        <p className="text-center text-xs text-muted-foreground/40 mt-10">
          Propulsé par{' '}
          <a href="https://kamforms.kamtech.online/" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/60 transition-colors underline-offset-2 hover:underline">Kamforms</a>
          {' · '}
          <a href="https://kamtech.online" target="_blank" rel="noopener noreferrer" className="hover:text-muted-foreground/60 transition-colors underline-offset-2 hover:underline">Kamtech</a>
        </p>
      </div>
    </PublicFormWrapper>
  )
}
