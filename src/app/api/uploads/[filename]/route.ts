import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, extname } from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

// Only allow UUID-style filenames (no path traversal)
const SAFE_FILENAME = /^[0-9a-f-]+\.(jpg|jpeg|png|webp)$/i

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }

  try {
    const buffer = await readFile(join(UPLOAD_DIR, filename))
    const ext = extname(filename).toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
