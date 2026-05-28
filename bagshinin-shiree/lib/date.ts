const MONTHS_MN = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
]

export function formatMongolianDate(date: string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()} оны ${MONTHS_MN[d.getMonth()]}ын ${d.getDate()}`
}

export function formatShortDate(date: string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}.${m}.${day}`
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
