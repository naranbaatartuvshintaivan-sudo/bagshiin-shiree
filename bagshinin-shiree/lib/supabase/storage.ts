const BUCKET = "lesson-assets"

export function getFilePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return ""
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`
}
