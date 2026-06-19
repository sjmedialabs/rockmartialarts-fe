import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
}

function uploadRoot(): string {
  const fromEnv = process.env.UPLOAD_ROOT?.trim()
  if (fromEnv) return path.resolve(fromEnv)
  return path.join(process.cwd(), "public", "uploads")
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return MIME[ext] || "application/octet-stream"
}

/**
 * Serve user uploads at runtime. Next.js production only serves public/ files
 * that existed at build time; new coach photos uploaded after deploy 404 otherwise.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path
  if (!Array.isArray(segments) || segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (segments.some((s) => !s || s === ".." || s === "." || s.includes("\\"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  const root = uploadRoot()
  const filePath = path.resolve(root, ...segments)

  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let stat: fs.Stats
  try {
    stat = fs.statSync(filePath)
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!stat.isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = fs.readFileSync(filePath)
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "public, max-age=3600",
      "Content-Length": String(stat.size),
    },
  })
}
