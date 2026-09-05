import 'server-only'

import { auth, currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

const ADMIN_SLUG_PATTERN = /^[a-zA-Z0-9-]+$/

export function getAdminSecretPath() {
  const secretPath = process.env.ADMIN_SECRET_PATH?.trim()

  if (!secretPath || !ADMIN_SLUG_PATTERN.test(secretPath)) {
    return null
  }

  return secretPath
}

function isAdminEmail(email: string | null | undefined) {
  if (!email) return false

  const allowedEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)

  return allowedEmails.includes(email.toLowerCase())
}

export async function requireHiddenAdminAccess(params: { adminSecret: string }) {
  const secretPath = getAdminSecretPath()

  if (!secretPath || params.adminSecret !== secretPath) {
    notFound()
  }

  const { userId } = await auth()
  if (!userId) {
    notFound()
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  if (!isAdminEmail(email)) {
    notFound()
  }

  return {
    userId,
    email: email!,
    basePath: `/${secretPath}`,
  }
}
