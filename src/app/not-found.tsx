import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-6xl font-extrabold">404</p>
      <p className="text-lg font-semibold">Page introuvable</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cette page a pris un raccourci un peu trop ambitieux. Revenons au bon endroit.
      </p>
      <Link href="/" className="mt-2 underline text-sm text-muted-foreground hover:text-foreground">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
