import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { authAppearance } from '../../auth-appearance'

export default function SignInPage() {
  return (
    <div className="auth-clerk w-full max-w-full sm:max-w-[410px]">
      <div className="mb-7 text-center">
        <h2 className="font-heading text-[1.65rem] font-extrabold tracking-tight text-foreground leading-tight">
          Bon retour parmi nous
        </h2>
        <p className="mx-auto mt-2 max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
          Connectez-vous pour gérer vos formulaires et vos demandes WhatsApp.
        </p>
      </div>
      <SignIn
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={authAppearance}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
          Créer un compte gratuit
        </Link>
      </p>
    </div>
  )
}
