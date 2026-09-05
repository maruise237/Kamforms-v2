import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { authAppearance } from '../../auth-appearance'

export default function SignUpPage() {
  return (
    <div className="auth-clerk w-full max-w-full sm:max-w-[410px]">
      <div className="mb-7 text-center">
        <h2 className="font-heading text-[1.65rem] font-extrabold tracking-tight text-foreground leading-tight">
          Créer votre compte
        </h2>
        <p className="mx-auto mt-2 max-w-[19rem] text-sm leading-relaxed text-muted-foreground">
          Un formulaire actif, 100 notifications WhatsApp et analytique inclus.
        </p>
      </div>
      <SignUp
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={authAppearance}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{' '}
        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
